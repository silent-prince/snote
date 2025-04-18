from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

def notes_login(request):
    
    if request.user.is_authenticated:
        #return post_login_check(request)  # If already logged in, go to dashboard
        return redirect("notes_page")
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        print(username)
        if user is not None:
            login(request, user)
            print(f"user with username {username} loggged in is {user.is_staff}")
            #return post_login_check(request)  # Return its response
            if user.is_staff:
                return redirect("choosewho")
            #user = User.objects.get(username='myst')
            # Store user id in session
            request.session['whois'] = 'myst' #this is user name
            request.session["receiver"]=User.objects.get(username="myst").id
            return redirect("notes_page")
        else:
            return render(request, 'notes_login.html', {'error': 'Invalid email or password'})
    
    return render(request, 'notes_login.html')

def user_logout(request):
    request.session.flush()
    logout(request)
    return redirect('notes_login') 
@login_required
def choosewho(request):
    selected_user = None
    print("insdie choose who ")
    selected_user = request.session.get("whois")
    if request.method == "POST":
        print("insdie choose who post ")
        whois = request.POST.get("whois")
        if whois:
            request.session["whois"] = whois  # Store user ID in session
            request.session["receiver"]=User.objects.get(username=whois).id
            #selected_user = User.objects.get(username=whois)  # Fetch user object
            return redirect("notes_page")
    non_staff_users = User.objects.filter(is_staff=False)  # Get all non-staff users
    return render(request, "choosewho.html", {"users": non_staff_users, "selected_user": selected_user})
