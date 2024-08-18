#!/bin/bash

# Call the first URL and get the JSON response
base_url="https://clubs.essiebes.nl/virtual-dolls/api"
params="filter%5Bstatus%5D%5B_eq%5D=published&filter%5Bstart_date%5D%5B_lte%5D=\$NOW()&filter%5Bgroup_photo%5D%5B_nnull%5D=true&fields%5B%5D=id,start_date,group_photo&sort=-start_date&limit=1"
url="$base_url/items/events?$params"
echo "URL: $url"
response=$(curl -s $url)

# Extract the group photo ID using jq
group_photo_id=$(echo $response | jq -r '.data[0].group_photo')
echo "Group photo ID: $group_photo_id"

# Construct the URL for the group photo
photo_url_1024="$base_url/assets/$group_photo_id?fit=inside&width=1024&height=1024&quality=80&withoutEnlargement=true&format=webp"
photo_url_2048="$base_url/assets/$group_photo_id?fit=inside&width=2048&height=2048&quality=80&withoutEnlargement=true&format=webp"

echo "Group photo URL (1024x1024): $photo_url_1024"
echo "Group photo URL (2048x2048): $photo_url_2048"

# Download the group photo and save it as latest_group_photo.png
curl -s $photo_url_1024 -o latest_group_photo_x1024.webp
curl -s $photo_url_2048 -o latest_group_photo_x2048.webp

echo "Downloaded the latest group photo as latest_group_photo_x1024 and latest_group_photo_x2048"