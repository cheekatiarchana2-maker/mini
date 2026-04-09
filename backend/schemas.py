from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserSettingsOut(BaseModel):
    dangerous_spikes: bool
    anomaly_alerts: bool
    forecasting_alerts: bool
    pattern_alerts: bool
    cost_optimization_alerts: bool
    language: str
    dark_mode: bool
    monthly_budget: float

    model_config = ConfigDict(from_attributes=True)


class UserSettingsUpdate(BaseModel):
    dangerous_spikes: Optional[bool] = None
    anomaly_alerts: Optional[bool] = None
    forecasting_alerts: Optional[bool] = None
    pattern_alerts: Optional[bool] = None
    cost_optimization_alerts: Optional[bool] = None
    language: Optional[str] = None
    dark_mode: Optional[bool] = None
    monthly_budget: Optional[float] = None


class UserCreate(BaseModel):
    email: str
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str] = None
    settings: Optional[UserSettingsOut] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ConsumptionOut(BaseModel):
    timestamp: datetime
    consumption_kwh: float
    ac_active: int
    heater_active: int
    tv_active: int
    washing_machine_active: int
    fan_active: int
    fridge_active: int

    model_config = ConfigDict(from_attributes=True)
