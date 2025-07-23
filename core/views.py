from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from .forms import FileUploadForm
from .models import File
from django.db.models import Q

# Create your views here.
from django.http import HttpResponse


@login_required
@never_cache
def index(request):
    return render(request, 'index.html')

@login_required
def dashboard(request):
    return render(request, 'dashboard.html')

@login_required
def file_manager(request):
    files = File.objects.filter(user=request.user)
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            file_obj = form.save(commit=False)
            file_obj.user = request.user
            file_obj.save()
            return redirect('file_manager')
    else:
        form = FileUploadForm()
    return render(request, 'file_manager.html', {'files': files, 'form': form})

@login_required
def settings(request):
    if request.method == 'GET':
            return render(request, 'settings.html')
    else:
        return render(request, "error.html")



@login_required
def files_type(request, type):
    file_qs = File.objects.filter(user=request.user)

    # Define extensions by category
    file_types = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
        'videos': ['.mp4', '.avi', '.mov', '.mkv', '.wmv'],
        'audios': ['.mp3', '.wav', '.aac', '.flac', '.ogg'],
        'docs':   ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    }

    if type == 'others':
        # Create a query to exclude all known extensions
        exclude_query = Q()
        for exts in file_types.values():
            for ext in exts:
                exclude_query |= Q(file__icontains=ext)
        file_qs = file_qs.exclude(exclude_query)
    else:
        extensions = file_types.get(type, [])
        if extensions:
            query = Q()
            for ext in extensions:
                query |= Q(file__icontains=ext)
            file_qs = file_qs.filter(query)

    return render(request, "files/files.html", {
        "title": type,
        "files": file_qs
    })



def error_400(request, exception):
    return render(request, "error.html", {"message": "Bad Request (400)"}, status=400)

def error_403(request, exception):
    return render(request, "error.html", {"message": "Forbidden (403)"}, status=403)

def error_404(request, exception):
    return render(request, "error.html", {"message": "Page Not Found (404)"}, status=404)

def error_500(request):
    return render(request, "error.html", {"message": "Internal Server Error (500)"}, status=500)
