import sys
import os
sys.path.insert(0, os.path.abspath('../dsp-backend'))
from app.core.config import settings

print(settings.DATABASE_URL)
