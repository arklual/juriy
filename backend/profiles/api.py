from datetime import datetime

from django.http import Http404
from ninja import Router, Schema, Field
from django.contrib import auth
from django.db import IntegrityError
import jwt
import os
import random
from .models import Profile
from .schemas import Token, UserSignin, UserProfile, Error, StatusOK, UserConfirm
from web2_backend.settings import SECRET_KEY
from django.core.mail import send_mail

router = Router()

@router.post('/register', response={201: UserProfile, 409: Error, 400: Error})
def signup(request, user: UserSignin):
    account = Profile.objects.create_user(email=user.login, password=user.password)
    account.save()
    return 201, {
        "login": account.email
    }

@router.post('/send_code_to_email', response={201: UserProfile, 409: Error, 400: Error,403: Error, 404: Error})
def send_code(request, user: UserSignin):
    account = auth.authenticate(username=user.login, password=user.password)
    if account:
        if not account.is_verf:
            account.verf_code = str(random.randint(100000, 999999))
            account.save()
            send_mail(
                "Code",
                str(account.verf_code),
                'admin@idealpick.ru',
                [account.email],
                fail_silently=False,
            )
            return 201, {
                "login": account.email
            }
        else:
            return 403, {"details": "already verif"}
    else:
        return 404, {"details": "user not found"}
    


@router.post('/confirm_email', response={200: StatusOK, 404: Error, 400: Error,403: Error     })
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



@router.post('/sign-in', response={200: Token, 404: Error, 400: Error ,403: Error    })
def signin(request, user: UserSignin):
    account = auth.authenticate(username=user.login, password=user.password)
    if account is not None:
        if account.is_verf:
            encoded_jwt = jwt.encode({"createdAt": datetime.utcnow().timestamp(), "user_id": account.id}, SECRET_KEY, algorithm="HS256")
            return 200, {"token": encoded_jwt}
        else:
            return 403, {"details": "not verif"}
    else:
        return 404, {"details": "user not found"}
