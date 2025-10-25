from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HealthRecordCreate(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_sugar: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = None
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HealthRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_sugar: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = None
    recorded_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    time_of_day: List[str]
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class Medication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    dosage: str
    frequency: str
    time_of_day: List[str]
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(name=user_data.name, email=user_data.email)
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['password_hash'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    token = create_token(user.id)
    
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    return {"token": token, "user": {"id": user['id'], "name": user['name'], "email": user['email']}}

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Health Records endpoints
@api_router.post("/health-records", response_model=HealthRecord)
async def create_health_record(record: HealthRecordCreate, user_id: str = Depends(get_current_user)):
    health_record = HealthRecord(user_id=user_id, **record.model_dump())
    record_dict = health_record.model_dump()
    record_dict['recorded_at'] = record_dict['recorded_at'].isoformat()
    record_dict['created_at'] = record_dict['created_at'].isoformat()
    
    await db.health_records.insert_one(record_dict)
    return health_record

@api_router.get("/health-records", response_model=List[HealthRecord])
async def get_health_records(user_id: str = Depends(get_current_user), days: int = 30):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    records = await db.health_records.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("recorded_at", -1).to_list(1000)
    
    for record in records:
        if isinstance(record.get('recorded_at'), str):
            record['recorded_at'] = datetime.fromisoformat(record['recorded_at'])
        if isinstance(record.get('created_at'), str):
            record['created_at'] = datetime.fromisoformat(record['created_at'])
    
    return records

@api_router.get("/health-records/{record_id}", response_model=HealthRecord)
async def get_health_record(record_id: str, user_id: str = Depends(get_current_user)):
    record = await db.health_records.find_one({"id": record_id, "user_id": user_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    if isinstance(record.get('recorded_at'), str):
        record['recorded_at'] = datetime.fromisoformat(record['recorded_at'])
    if isinstance(record.get('created_at'), str):
        record['created_at'] = datetime.fromisoformat(record['created_at'])
    
    return record

@api_router.delete("/health-records/{record_id}")
async def delete_health_record(record_id: str, user_id: str = Depends(get_current_user)):
    result = await db.health_records.delete_one({"id": record_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}

# Medications endpoints
@api_router.post("/medications", response_model=Medication)
async def create_medication(med: MedicationCreate, user_id: str = Depends(get_current_user)):
    medication = Medication(user_id=user_id, **med.model_dump())
    med_dict = medication.model_dump()
    med_dict['start_date'] = med_dict['start_date'].isoformat()
    if med_dict.get('end_date'):
        med_dict['end_date'] = med_dict['end_date'].isoformat()
    med_dict['created_at'] = med_dict['created_at'].isoformat()
    
    await db.medications.insert_one(med_dict)
    return medication

@api_router.get("/medications", response_model=List[Medication])
async def get_medications(user_id: str = Depends(get_current_user), active_only: bool = True):
    query = {"user_id": user_id}
    if active_only:
        query["active"] = True
    
    medications = await db.medications.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for med in medications:
        if isinstance(med.get('start_date'), str):
            med['start_date'] = datetime.fromisoformat(med['start_date'])
        if med.get('end_date') and isinstance(med['end_date'], str):
            med['end_date'] = datetime.fromisoformat(med['end_date'])
        if isinstance(med.get('created_at'), str):
            med['created_at'] = datetime.fromisoformat(med['created_at'])
    
    return medications

@api_router.put("/medications/{med_id}")
async def update_medication(med_id: str, updates: MedicationCreate, user_id: str = Depends(get_current_user)):
    update_dict = updates.model_dump()
    update_dict['start_date'] = update_dict['start_date'].isoformat()
    if update_dict.get('end_date'):
        update_dict['end_date'] = update_dict['end_date'].isoformat()
    
    result = await db.medications.update_one(
        {"id": med_id, "user_id": user_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication updated"}

@api_router.delete("/medications/{med_id}")
async def delete_medication(med_id: str, user_id: str = Depends(get_current_user)):
    result = await db.medications.update_one(
        {"id": med_id, "user_id": user_id},
        {"$set": {"active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted"}

# Analytics endpoints
@api_router.get("/analytics/trends")
async def get_trends(user_id: str = Depends(get_current_user), days: int = 30):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    records = await db.health_records.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("recorded_at", 1).to_list(1000)
    
    return {"records": records}

@api_router.get("/analytics/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    total_records = await db.health_records.count_documents({"user_id": user_id})
    active_meds = await db.medications.count_documents({"user_id": user_id, "active": True})
    
    # Get latest records for each vital
    latest_record = await db.health_records.find_one(
        {"user_id": user_id},
        {"_id": 0}
    , sort=[("recorded_at", -1)])
    
    return {
        "total_records": total_records,
        "active_medications": active_meds,
        "latest_vitals": latest_record or {}
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()