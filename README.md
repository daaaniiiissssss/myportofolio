Nama : Nauval Adiva Daneshwara
NPM : 2506623074
Kelas : PBP A

dosen : Jessica Naraiswari Arwidarasti

### Tugas 1

1. 
Iya saya menggunakan <section> dan <article>. section saya gunakan untuk membagi halaman menjadi beberapa bagian
seperti namanya (section = bagian), saya gunakan ini untuk
membagi Profile, Education, dan Experience. Lalu article 
saya gunakan untuk membagi setiap item pada section
tersebut seperti riwayat pendidikan dan pengalaman.
Ini saya gunakan agar website saya lebih terorganisir
dan tidak berantakan agar nyaman dilihat.

2.
Sejujurnya hingga sekarang saya masih kebingungan 
mengatur ukuran untuk mobile, karena tata letaknya yang berbeda. Lalu juga ukurannya harus diganti, itu sangat amat membuat saya kebingungan.

3.
Ketika harus mengganti sesuatu, saya harus berpindah pindah ke kode HTML, menurut saya itu sangatlah tidak praktis apalagi jika kita ingin mengganti hal hal kecil secara berkala. Saya ingin menambahkan fitur dinamis seperti halaman Projects yang datanya bisa ditambahkan/diperbarui tanpa harus kembali terus ke HTML secara manual.

Penggunaan AI:
Saya menggunakan ChatGPT untuk mendapatkan gambaran apa yang sekiranya berbeda dari pengerjaan saya saat tutorial. Lalu sisanya saya kerjakan dengan copy bagian tutorial, karena pada dasarnya bagian tugas ini mirip dengan saat membuat bagian profile tutorial 1.

### Tugas 2

1.
Ketika kita membuka halaman portfolio baru, browser mengirimkan request ke URL tujuan. Request tersebut diproses oleh urls.py pada project untuk menentukan aplikasi yang menjalankan URL tersebut, kemudian diteruskan urls.py di main. Lalu, URL akan diarahkan ke view yang benar. View mengambil data Education dari model menggunakan Education.objects.all(), Terus memasukkan data tersebut ke dalam context dan mengirimkannya ke template education.html. Template lalu menampilkan data tersebut menggunakan Django Template Language.

2.
Data portfolio disimpan di dalam model karena data dapat dikelola dan diperbarui dengan lebih mudah tanpa harus mengubah kode HTML. Jadinya kita bisa melakukan pemeliharaan website dengan lebih mudah.

3.
makemigrations digunakan untuk membuat file migration sesuai model, kalo migrate digunakan untuk menerapkan migration tersebut ke database. Contohnya ketika menambahkan model Education dengan beberapa field baru, kita menjalankan python manage.py makemigrations untuk membuat file migration, kemudian menjalankan python manage.py migrate agar tabel Education dibuat di database.
