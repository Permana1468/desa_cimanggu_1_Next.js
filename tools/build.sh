#!/bin/bash
set -e

echo "== Building Frontend =="
cd frontend
npm install --include=dev
npm run build
cd ..

# Verify the build output
echo "== Verifying Build Artifacts =="
if [ -f "frontend/dist/index.html" ]; then
    echo "SUCCESS: frontend/dist/index.html exists"
    ls -la frontend/dist/
else
    echo "ERROR: frontend/dist/index.html NOT FOUND"
    exit 1
fi

# Collect static files for Django
echo "== Collecting Static Files =="
python3 manage.py collectstatic --noinput

echo "== Build Finished Successfully =="
