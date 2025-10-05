#!/bin/bash

# Build and push Docker image to Docker Hub
# Usage: ./build.sh [dockerhub-username] [tag]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKERHUB_USERNAME=${1:-"your-dockerhub-username"}
IMAGE_NAME="restaurant-revenue-api"
TAG=${2:-"latest"}
FULL_IMAGE_NAME="${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"

echo -e "${GREEN}🚀 Building Docker image for Restaurant Revenue API${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}${NC}"
echo -e "${YELLOW}Platform: linux/amd64 (for VPS deployment)${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    echo -e "${YELLOW}⚠️  You're not logged in to Docker Hub. Please run:${NC}"
    echo -e "${YELLOW}   docker login${NC}"
    echo ""
fi

# Build the image for linux/amd64 platform (VPS architecture)
echo -e "${GREEN}📦 Building Docker image...${NC}"
docker build \
    --platform linux/amd64 \
    --tag "${FULL_IMAGE_NAME}" \
    --tag "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest" \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Push to Docker Hub
echo -e "${GREEN}🚀 Pushing to Docker Hub...${NC}"
docker push "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Image is now available at:${NC}"
    echo -e "${YELLOW}   docker pull ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${GREEN}📋 To deploy on your VPS, run:${NC}"
    echo -e "${YELLOW}   docker pull ${FULL_IMAGE_NAME}${NC}"
    echo -e "${YELLOW}   docker run -d --name restaurant-api -p 3214:3214 ${FULL_IMAGE_NAME}${NC}"
else
    echo -e "${RED}❌ Push failed!${NC}"
    exit 1
fi

# Show image size
echo -e "${GREEN}📊 Image information:${NC}"
docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
