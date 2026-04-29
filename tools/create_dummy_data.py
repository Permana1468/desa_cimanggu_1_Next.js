import sys, os
import django
from django.utils import timezone
from datetime import date, time, timedelta

# Add root folder to sys path to find backend package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.users.models import JadwalGotongRoyong, UsulanMusrenbang, CustomUser

def create_all_lpm_dummy():
    # Find all LPM users
    lpm_users = CustomUser.objects.filter(role='LPM')
    print(f"Found {lpm_users.count()} LPM users.")

    for user in lpm_users:
        wilayah = user.unit_detail or 'Desa'
        print(f"Adding dummy for {user.username} (Wilayah {wilayah})...")

        # 1. Jadwal Gotong Royong
        JadwalGotongRoyong.objects.get_or_create(
            judul=f'Kerja Bakti Wilayah {wilayah}',
            tanggal=date.today() + timedelta(days=3),
            waktu=time(8, 0),
            lokasi=f'Area Balai Wilayah {wilayah}',
            koordinator='Bpk. Koordinator',
            alat_dibawa='Peralatan kebersihan lengkap',
            peserta_target=f'Seluruh Warga Wilayah {wilayah}',
            penyelenggara_wilayah=wilayah,
            defaults={'status': 'Akan Datang'}
        )

        # 2. Usulan Musrenbang
        UsulanMusrenbang.objects.get_or_create(
            judul=f'Pembangunan Drainase Wilayah {wilayah}',
            pengusul=user,
            defaults={
                'kategori': 'Infrastruktur & Fisik',
                'lokasi': wilayah,
                'alamat_lengkap': f'Jl. Utama Wilayah {wilayah}, Dekat Pos Kamling',
                'deskripsi': 'Perbaikan saluran pembuangan air untuk mencegah banjir saat musim hujan.',
                'estimasi_biaya': 12000000.00,
                'volume': '100 Meter',
                'status': 'MENUNGGU'
            }
        )
    
    print("Successfully created dummy data for all LPM users.")

if __name__ == "__main__":
    create_all_lpm_dummy()
