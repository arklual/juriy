from datetime import datetime

from django.http import Http404
from django.views.decorators.csrf import csrf_exempt
from ninja import Router, Schema, Field
from django.contrib import auth
from django.db import IntegrityError
import jwt
import os
import random
from .models import Profile
from .schemas import Token, UserSignin, UserProfile, Error, StatusOK, UserConfirm, PasswordResetRequest, PasswordReset
from web2_backend.settings import SECRET_KEY
from django.core.mail import send_mail

router = Router()

def send_verification_code(email, code):
    send_mail(
        "Код подтверждения",
        f"Ваш код подтверждения: {code}",
        'admin@ideal-pick.ru',
        [email],
        fail_silently=False,
    )

@router.post('/register', response={201: UserProfile, 409: Error, 400: Error})
def signup(request, user: UserSignin):
    try:
        account = Profile.objects.create_user(email=user.login, password=user.password)
        # Генерируем и отправляем код подтверждения
        account.verf_code = str(random.randint(100000, 999999))
        account.save()
        send_verification_code(account.email, account.verf_code)
        return 201, {
            "login": account.email
        }
    except IntegrityError:
        return 409, {"details": "email already exists"}

@router.post('/send_code_to_email', response={201: UserProfile, 409: Error, 400: Error,403: Error, 404: Error})
def send_code(request, user: UserSignin):
    account = auth.authenticate(username=user.login, password=user.password)
    if account:
        if not account.is_verf:
            account.verf_code = str(random.randint(100000, 999999))
            account.save()
            send_verification_code(account.email, account.verf_code)
            return 201, {
                "login": account.email
            }
        else:
            return 403, {"details": "already verified"}
    else:
        return 404, {"details": "user not found"}

@router.post('/confirm_email', response={200: StatusOK, 404: Error, 400: Error,403: Error})
def confirm_email(request, user: UserConfirm):
    account = auth.authenticate(username=user.login, password=user.password)
    if account is not None:
        if account.is_verf:
            return 200, {'status': 'OK'}
        if str(account.verf_code) == str(user.code):
            account.is_verf = True
            account.save()
            return 200, {'status': 'OK'}
        else:
            return 403, {"details": "code is wrong"}
    else:
        return 404, {"details": "user not found"}

@router.post('/sign-in', response={200: Token, 404: Error, 400: Error ,403: Error})
def signin(request, user: UserSignin):
    account = auth.authenticate(username=user.login, password=user.password)
    if account is not None:
        if account.is_verf:
            encoded_jwt = jwt.encode({"createdAt": datetime.utcnow().timestamp(), "user_id": account.id}, SECRET_KEY, algorithm="HS256")
            return 200, {"token": encoded_jwt}
        else:
            return 403, {"details": "not verified"}
    else:
        return 404, {"details": "user not found"}

@router.post('/reset-password-request', response={200: StatusOK, 404: Error})
def reset_password_request(request, data: PasswordResetRequest):
    try:
        account = Profile.objects.get(email=data.login)
        account.verf_code = str(random.randint(100000, 999999))
        account.save()
        send_mail(
            "Восстановление пароля",
            f"Ваш код для восстановления пароля: {account.verf_code}",
            'admin@ideal-pick.ru',
            [account.email],
            fail_silently=False,
        )
        return 200, {'status': 'OK'}
    except Profile.DoesNotExist:
        return 404, {"details": "user not found"}

@router.post('/reset-password', response={200: StatusOK, 404: Error, 403: Error})
def reset_password(request, data: PasswordReset):
    try:
        account = Profile.objects.get(email=data.login)
        if str(account.verf_code) == str(data.code):
            account.set_password(data.new_password)
            account.verf_code = ''  # Очищаем код после использования
            account.save()
            return 200, {'status': 'OK'}
        else:
            return 403, {"details": "code is wrong"}
    except Profile.DoesNotExist:
        return 404, {"details": "user not found"}
