from .my_imports import login_required, helper,pusher,db_ops_aarumi,json,Aarumi,manage_pusher,JsonResponse,render

@login_required
def aarumi_home(request):
    #aarumis=Aarumi.objects.all()
    aarumis_list=db_ops_aarumi.makeAllReceivedSeen(request)
    if aarumis_list:
        manage_pusher.makeAllSeen(request)
    aarumis=db_ops_aarumi.getAarumis(request)
    #print(aarumis)
    return render(request,'aarumi.html',{"aarumis":aarumis})

@login_required
def add_aarumi(request):
    if request.method == "POST":
        try:
            aarumi=db_ops_aarumi.save_aarumi(request)
            response=manage_pusher.send_push_message(aarumi)
            return JsonResponse({"success": True,"aarumiid":aarumi.id,"createdat":aarumi.created_at})
        except json.JSONDecodeError as e:
            return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)
@login_required
def seenByMe(request):
    if request.method=="POST":
        try:
            res=db_ops_aarumi.seenByMe(request)
            if(res):
                manage_pusher.makeSingleSeen(request)
            return JsonResponse({"success": True}, status=200)
        except Exception as e:
            print("error while making seen ",e)
            return JsonResponse({"success": False}, status=400)
    print("seen by me not a post")
    return JsonResponse({"success": False}, status=400)
@login_required
def getMissedData(request):
    if request.method == "POST":
        try:
            #after reconnect
            #the message u sent(get ids from ui) check in db if those are seen by other person if yes send update in ajax for blue tick on my screen
            #get missed messages from db send in ajax for your screen and send pusher for next person to do blue tick
            sentSeenIds,seen_or_received=db_ops_aarumi.checkNewIdsIfSeen(request)
            newAarumiList=db_ops_aarumi.makeAllReceivedSeen(request)#send to next user
            serializedArrumis=None
            if newAarumiList:
                serializedArrumis=helper.aarumiSerializer(newAarumiList)
                response=manage_pusher.makeAllSeen(request)
            return JsonResponse({"success": True,"sentSeenIds":sentSeenIds,"seen_or_received":seen_or_received,"newAarumiList":serializedArrumis},status=200)
        except json.JSONDecodeError as e:
            return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)