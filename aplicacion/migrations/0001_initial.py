# Generated by Django 5.2.1 on 2025-05-29 18:36

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rol',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rol', models.CharField(max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name='Ubicacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ubicacion', models.CharField(max_length=150)),
            ],
        ),
        migrations.CreateModel(
            name='Zona',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=80)),
                ('responsable', models.CharField(max_length=80)),
                ('ubicacion', models.CharField(max_length=150)),
            ],
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('nombre', models.CharField(max_length=80)),
                ('apellido', models.CharField(max_length=80)),
                ('cedula', models.CharField(max_length=12, unique=True)),
                ('telefono', models.CharField(max_length=13)),
                ('email', models.EmailField(max_length=100, unique=True)),
                ('foto_perfil', models.ImageField(blank=True, null=True, upload_to='perfiles/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])])),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('reset_token', models.CharField(blank=True, max_length=64, null=True)),
                ('reset_token_expiration', models.DateTimeField(blank=True, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                ('rol', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='aplicacion.rol')),
                ('zona', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='aplicacion.zona')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Backup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('tamano', models.CharField(max_length=20)),
                ('estado', models.CharField(default='Completo', max_length=50)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('tipo', models.CharField(choices=[('completa', 'Completa'), ('incremental', 'Incremental')], default='completa', max_length=50)),
                ('ruta_archivo', models.CharField(blank=True, max_length=255, null=True)),
                ('incluye_db', models.BooleanField(default=True)),
                ('incluye_archivos', models.BooleanField(default=True)),
                ('incluye_config', models.BooleanField(default=True)),
                ('creado_por', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-fecha'],
            },
        ),
        migrations.CreateModel(
            name='Evidencia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_subida', models.DateTimeField(auto_now_add=True)),
                ('usuario_nombre', models.CharField(blank=True, max_length=160)),
                ('actividad', models.CharField(blank=True, max_length=255)),
                ('ubicacion', models.CharField(max_length=255)),
                ('observaciones', models.TextField(blank=True)),
                ('archivo_url', models.URLField()),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ImagenEvidencia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=40)),
                ('descripcion', models.CharField(max_length=250)),
                ('link_imagen', models.CharField(max_length=250)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('evidencia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='imagenes', to='aplicacion.evidencia')),
            ],
            options={
                'verbose_name': 'Imagen de Evidencia',
                'verbose_name_plural': 'Imágenes de Evidencias',
            },
        ),
        migrations.CreateModel(
            name='FaunaFlora',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.PositiveIntegerField(blank=True, null=True)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('tipo', models.CharField(choices=[('Flora', 'Flora'), ('Fauna', 'Fauna')], max_length=10)),
                ('nombre_especie', models.CharField(max_length=80)),
                ('descripcion', models.TextField(max_length=300)),
                ('imagen_url', models.URLField(blank=True, max_length=500, null=True)),
                ('imagen_public_id', models.CharField(blank=True, max_length=255, null=True)),
                ('estado', models.CharField(default='Reportado', max_length=250)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('zona', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='aplicacion.zona')),
            ],
            options={
                'verbose_name': 'Fauna y Flora',
                'verbose_name_plural': 'Fauna y Flora',
            },
        ),
        migrations.CreateModel(
            name='Emergencia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.IntegerField()),
                ('fecha', models.DateField()),
                ('tipo', models.CharField(choices=[('Incendio', 'Incendio'), ('Maltrato', 'Maltrato'), ('Caza de Fauna', 'Caza de Fauna')], max_length=50)),
                ('gravedad', models.CharField(choices=[('Baja', 'Baja'), ('Media', 'Media'), ('Alta', 'Alta')], max_length=20)),
                ('observaciones', models.TextField()),
                ('imagen_url', models.URLField()),
                ('imagen_public_id', models.CharField(blank=True, max_length=255, null=True)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emergencias', to=settings.AUTH_USER_MODEL)),
                ('zona', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='aplicacion.zona')),
            ],
            options={
                'ordering': ['-numero'],
                'unique_together': {('numero', 'usuario')},
            },
        ),
    ]
