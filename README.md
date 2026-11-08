Nama : Nauval Adiva Daneshwara
NPM : 2506623074
Kelas : PBP A

dosen : Jessica Naraiswari Arwidarasti

### Tugas 1

1. 
Iya saya menggunakan section dan article. section saya gunakan untuk membagi halaman menjadi beberapa bagian
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

Penggunaan AI:
Saya menggunakan ChatGPT untuk mendapatkan gambaran apa yang sekiranya berbeda dari pengerjaan saya saat tutorial. Lalu karena basically sama saja, saya tinggal melakukan ulang apayang saya lakukan saat tutorial 2.

### Tugas 3

1.
Saya menggunakan ModelForm karena menurut saya cara ini lebih praktis dibandingkan membuat form HTML dari awal. Field yang ada di form bisa langsung mengikuti field yang ada di model, sehingga saya tidak perlu membuat dan mengatur setiap input satu per satu. Selain itu, data yang dimasukkan melalui form juga bisa langsung diproses dan disimpan ke database. Untuk token, digunakan pada form yang mengirim data menggunakan method POST. Token tersebut membantu memastikan bahwa request yang dikirim memang berasal dari form yang valid pada website dan bukan request yang tidak diinginkan.

2.
Menurut saya, JSON lebih banyak digunakan karena bentuknya lebih sederhana dan lebih ringkas dibandingkan XML. Struktur JSON juga cukup mudah dibaca, baik oleh manusia maupun program. Selain itu, formatnya cocok dengan struktur data yang sering digunakan dalam pemrograman web. Pada tugas ini, JSON saya gunakan untuk menyediakan data Education melalui sebuah endpoint yang bisa diakses dari URL tertentu.

3.
Ketika URL untuk JSON Education dibuka, request akan diarahkan ke fungsi get_education_json. Di dalam fungsi tersebut, saya mengambil semua data Education dari database menggunakan Education.objects.all(). Data tersebut kemudian diubah menjadi JSON menggunakan serializers.serialize(), lalu dikirim kembali menggunakan HttpResponse. Serialization diperlukan karena data yang diambil dari model Django masih berupa object atau QuerySet. Data tersebut perlu diubah terlebih dahulu ke format JSON supaya bisa dikirim melalui HTTP dan dibaca sebagai data JSON oleh aplikasi.

Penggunaan AI:
Saya menggunakan ChatGPT karena saya masih sedikit linglung penggunaan JSON, dan saat saya sudah commit, ada error (ga keubah padahal harusnya udah) sehingga saya menggunakan AI untuk mencari solusi nya.

Tugas 4
Penggunaan AI:
Untuk tugas ini, saya menggunakan AI karna tidak begitu paham dengan cara menambahkan superuser dan editor, itulahh mengapa saya menggunakan ChatGPT.

Tugas 5
1.
Debouncing adalah cara untuk membatasi request agar tidak dikirim terus-menerus setiap kali kita mengetik. Pada pencarian AJAX, ini berguna supaya server tidak menerima terlalu banyak request dan pencarian jadi lebih ringan.

2.
await digunakan untuk menunggu fetch() selesai mengambil data dari server. Kalau tidak pakai await, hasilnya masih berupa Promise, jadi data yang kita butuhkan belum bisa langsung dipakai.

3.
XSS adalah serangan dengan memasukkan script atau kode berbahaya ke dalam halaman web. Pada AJAX/JavaScript, hal ini bisa terjadi kalau data dari server langsung dimasukkan ke HTML tanpa pengamanan, misalnya menggunakan innerHTML. Sedangkan Django template sudah punya auto-escaping secara default, sehingga lebih aman dari serangan seperti ini.

Penggunaan AI:
Saya menggunakan AI mostly untuk tutorial 5 karena saya masih kuran familiar dengan JSON.

Tugas 6:

1.
REST (Representational State Transfer) adalah gaya arsitektur untuk merancang web API, bukan format data atau library. Prinsipnya: data diperlakukan sebagai resource yang ditunjuk oleh URL (misalnya /api/v1/experiences/ dan /api/v1/experiences/<uuid>/), tindakan dinyatakan oleh HTTP method (GET membaca, POST membuat, PUT/PATCH mengubah, DELETE menghapus), klien dan server bertukar representasi data (JSON), dan server bersifat stateless. Mengembalikan JSON saja belum cukup karena endpoint seperti /projects/add-ajax/ atau /projects/<id>/delete/ juga mengembalikan JSON tetapi menaruh tindakan di URL dan memakai POST untuk semuanya, sehingga tidak mengikuti aturan resource dan method. PUT mengirim representasi pengganti secara utuh, sehingga semua field wajib harus dikirim; cocok ketika klien memegang data lengkap, misalnya form edit yang mengirim ulang seluruh isi pengalaman. PATCH hanya mengirim field yang berubah (partial=True); cocok untuk perubahan kecil, misalnya hanya mengganti judul atau menambahkan tanggal selesai tanpa menyentuh field lain.

2.
Serializer adalah lapisan yang mengubah objek model menjadi tipe data Python yang bisa dirender menjadi JSON (serialization), dan sebaliknya memvalidasi serta membersihkan input klien sebelum disimpan (deserialization). Pada ExperienceSerializer, satu kelas mendefinisikan field yang dikirim, validasi (validate_title dengan strip_tags, validasi URL thumbnail, pilihan kategori), field read-only hasil perhitungan (star_count, is_starred), dan implementasi create/update lewat ModelSerializer. Dibandingkan merakit dictionary manual dengan JsonResponse seperti Tugas 5, serializer menghilangkan kode perulangan, menyatukan aturan validasi di satu tempat sehingga berlaku untuk semua jalur input, memberi pesan error per field secara konsisten (400), dan membuat bentuk data eksplisit sehingga data sensitif seperti email atau password tidak ikut terkirim.

3.
Autentikasi menjawab "siapa kamu": SessionAuthentication membaca cookie session dan mengisi request.user. Otorisasi menjawab "apa yang boleh kamu lakukan": permission class (IsPortfolioOwnerOrEditorOrReadOnly) memutuskan apakah request boleh diteruskan berdasarkan user dan method. Keduanya terpisah; pengunjung anonim lolos autentikasi sebagai anonim tetapi ditolak permission dengan 403 saat menulis. Hak akses harus diperiksa di server karena menyembunyikan tombol di template hanya mengubah tampilan; siapa pun tetap bisa mengirim request langsung lewat DevTools, curl, atau Browsable API. Hanya pemeriksaan di server yang benar-benar menolak tindakan, dan test API (misalnya pengunjung PATCH/DELETE harus 403 dan isi database tidak berubah) membuktikannya.

4.
Dengan SessionAuthentication, browser otomatis mengirim cookie session ke domain yang sama pada setiap request, termasuk request yang dipicu oleh situs lain yang sedang dibuka pengguna. Tanpa token CSRF, situs jahat bisa membuat browser korban yang sedang login mengirim POST/PUT/PATCH/DELETE yang dianggap sah oleh server (Cross-Site Request Forgery). Token CSRF hanya diketahui oleh halaman kita sendiri dan dikirim lewat header X-CSRFToken, sehingga request dari situs lain ditolak dengan 403. force_authenticate melewati proses login dan SessionAuthentication, sehingga pemeriksaan CSRF yang berada di SessionAuthentication tidak pernah dijalankan; test tetap hijau meskipun CSRF tidak berfungsi. Karena itu test CSRF memakai APIClient(enforce_csrf_checks=True) dan .login() yang membuat session sungguhan, lalu membuktikan POST tanpa token ditolak dan POST dengan token berhasil.

Penggunaan AI:
Saya menggunakan Claude (Anthropic) lewat chat untuk menyesuaikan Tutorial 07 dan Tugas 6 ke struktur proyek saya (model Education dan Experience), saya mayoritas menggunakan AI untuk keperluan saat saya kebingungan dalam dimana saya harus menambahkan sesuatu.
