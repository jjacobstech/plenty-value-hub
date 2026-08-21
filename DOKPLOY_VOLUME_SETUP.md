# Persist Storage Folder in Dokploy

## Problem
Every time you deploy the app in Dokploy, the Docker container is recreated and the `storage/uploads` folder is deleted. This causes all uploaded images to be lost.

## Solution
Mount a **persistent volume** from the host to the container's storage directory.

## Your App Configuration
- **Storage location:** `storage/uploads` (relative to app root)
- **Inside container:** `/app/storage/uploads`
- **Storage driver:** Local filesystem (DRIVE=fs)

## Setup Steps

### Step 1: Access Dokploy Dashboard
Navigate to your application in Dokploy

### Step 2: Add Volume in Dokploy UI
1. Go to your app → **Settings** → **Volumes** (or similar section)
2. Click **+ Add Volume** or **Add Persistent Storage**
3. Configure:
   - **Host Path:** `/data/plenty-value-hub/storage`
   - **Container Path:** `/app/storage`
   - **Read/Write:** Toggle ON for both read and write permissions

### Step 3: Redeploy
Dokploy will:
1. Create the volume
2. Mount it to the container
3. Preserve files across deployments

## Verification

### Check Volume is Mounted
After deployment, SSH into your server:

```bash
# List volumes
docker volume ls

# Check mounted volumes for your container
docker inspect <container-id> | grep -A 10 "Mounts"

# Or check from inside container
docker exec <container-id> df -h | grep storage
```

### Verify Uploads Persist
1. Upload an image in the app
2. Note the filename
3. Redeploy the app in Dokploy
4. Verify the image still exists and loads

## Alternative: Docker Compose Approach

If Dokploy exposes docker-compose configuration, you can manually add:

```yaml
version: '3.8'

services:
  app:
    image: your-app-image
    volumes:
      - app_storage:/app/storage  # Named volume (persists)
    # ... rest of config

volumes:
  app_storage:
    driver: local
```

## Advanced: Multiple Volumes

If you want to persist multiple directories:

```yaml
volumes:
  - /data/plenty-value-hub/storage:/app/storage
  - /data/plenty-value-hub/database:/app/database
  - /data/plenty-value-hub/logs:/app/logs
```

## Production Considerations

### 1. Backup Strategy
```bash
# Backup the storage volume
tar -czf backup-storage-$(date +%Y%m%d).tar.gz /data/plenty-value-hub/storage

# Restore from backup
tar -xzf backup-storage-20240115.tar.gz -C /
```

### 2. Permissions
Ensure the container user can write to the volume:

```bash
# Check current permissions
ls -la /data/plenty-value-hub/storage

# If needed, adjust permissions
sudo chown 1000:1000 /data/plenty-value-hub/storage
chmod 755 /data/plenty-value-hub/storage
```

### 3. S3 for Better Scalability
For production, consider migrating to S3/MinIO:

**Update `.env`:**
```
DRIVE=s3  # Change from fs to s3
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=plenty-value-hub
```

This provides:
- ✅ Automatic backups
- ✅ CDN integration
- ✅ Easier scaling
- ✅ Better disaster recovery

## Troubleshooting

### Uploads folder keeps resetting
- Verify volume is actually mounted: `docker inspect <container>`
- Check volume path in Dokploy matches container path `/app/storage`
- Ensure host path exists: `ls -la /data/plenty-value-hub/storage`

### Permission denied errors
```bash
# Check container user
docker exec <container> id

# Fix permissions (if needed)
sudo chown -R 1000:1000 /data/plenty-value-hub/storage
```

### Disk space issues
```bash
# Check available space
df -h /data

# Clean old uploads (if needed)
find /data/plenty-value-hub/storage -type f -mtime +90 -delete
```

## Quick Checklist
- [ ] Host path created: `/data/plenty-value-hub/storage`
- [ ] Volume added in Dokploy UI
- [ ] Container path set to: `/app/storage`
- [ ] App redeployed
- [ ] Upload test file and verify it persists after redeploy
- [ ] Backup strategy in place

## Next Steps
Once volumes are working:
1. Set up automated backups of `/data/plenty-value-hub/storage`
2. Monitor disk usage
3. Consider S3 migration for production scaling
