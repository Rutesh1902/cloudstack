from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from .forms import FileUploadForm
from .models import File
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



def error_400(request, exception):
    return render(request, "error.html", {"message": "Bad Request (400)"}, status=400)

def error_403(request, exception):
    return render(request, "error.html", {"message": "Forbidden (403)"}, status=403)

def error_404(request, exception):
    return render(request, "error.html", {"message": "Page Not Found (404)"}, status=404)

def error_500(request):
    return render(request, "error.html", {"message": "Internal Server Error (500)"}, status=500)
