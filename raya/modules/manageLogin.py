from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

def aarumi_login(request):
    if request.user.is_authenticated:
        return redirect("aarumi_home")  # If already logged in, go to home
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.is_staff:
                return redirect("user_list")
            request.session["receiver"]=User.objects.get(username="myst").id
            return redirect("aarumi_home")
        else:
            return render(request, 'aarumi_login.html', {'error': 'Invalid username or password'})
    return render(request, 'aarumi_login.html')

def raya_logout(request):
    request.session.flush()
    logout(request)
    return redirect('aarumi_login') 
@login_required
def user_list(request):
    if request.user.is_staff == False:
        return redirect("aarumi_home")
    selected_user = None
    print("insdie choose who ")
    selected_user = request.session.get("receiver")
    if request.method == "POST":
        print("insdie choose who post ")
        receiver = request.POST.get("receiver_id")
        if receiver:
            request.session["receiver"] = receiver  # Store user ID in session
            return redirect("aarumi_home")
    all_users = User.objects.exclude(id=request.user.id)  # Exclude the current user
    return render(request, "user_list.html", {"users": all_users, "selected_user": selected_user})
