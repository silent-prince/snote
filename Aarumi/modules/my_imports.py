from django.shortcuts import render,redirect,get_object_or_404
from Aarumi.models import Aarumi
from django.contrib import messages
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import pusher
from django.db.models import Q,Case, When, F, DateTimeField
from django.utils import timezone
from . import manage_pusher,db_ops_aarumi,helper
