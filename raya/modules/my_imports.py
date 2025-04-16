from django.shortcuts import render,redirect,get_object_or_404
from raya.models import Aarumi
from django.contrib import messages
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import pusher
from django.db.models import Q,Case, When, F, DateTimeField
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware
from . import manage_pusher,db_ops_aarumi,helper
from django.contrib.auth.models import User
