import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F6F4] text-[#303030]">

      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-[#E5E5DF] bg-[#F6F6F4] px-8 py-5">

        <h1 className="text-2xl font-bold text-[#101C36]">
          SkillBridge UMKM
        </h1>

        <div className="flex items-center gap-6">

          <a
            href="#tentang"
            className="font-medium text-[#303030] transition hover:text-[#101C36]"
          >
            Tentang
          </a>

          <a
            href="#cara-kerja"
            className="font-medium text-[#303030] transition hover:text-[#101C36]"
          >
            Cara Kerja
          </a>

          <a
            href="#proyek"
            className="font-medium text-[#303030] transition hover:text-[#101C36]"
          >
            Proyek
          </a>

          <Link
            href="/login"
            className="rounded-xl bg-[#101C36] px-5 py-2 font-semibold text-white transition hover:bg-[#303030]"
          >
            Masuk
          </Link>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-8 py-24 text-center">

        <div className="mb-6 inline-flex rounded-full bg-[#FBEDB9] px-5 py-2">
          <p className="font-semibold text-[#101C36]">
            Platform Micro-Project Mahasiswa × UMKM
          </p>
        </div>

        <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-[#101C36]">
          Hubungkan Skill Mahasiswa dengan{" "}
          <span className="relative inline-block">
            Kebutuhan Digital UMKM
            <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-[#FFD85E]" />
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#303030]/75">
          SkillBridge UMKM membantu mahasiswa mendapatkan proyek berbayar
          pertama sekaligus membantu UMKM menyelesaikan pekerjaan digital
          dengan ruang lingkup yang jelas.
        </p>

        <div className="mt-10 flex justify-center gap-4">

          <button className="rounded-xl bg-[#101C36] px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-[#303030]">
            Cari Proyek
          </button>

          <button className="rounded-xl bg-[#FFD85E] px-7 py-3 font-semibold text-[#101C36] shadow-sm transition hover:bg-[#FBEDB9]">
            Posting Proyek
          </button>

        </div>
      </section>

      {/* Tentang */}
      <section
        id="tentang"
        className="bg-[#101C36] px-8 py-20 text-white"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="font-semibold text-[#FFD85E]">
              SkillBridge untuk semua
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Untuk Siapa SkillBridge?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-white/70">
              Platform dua sisi yang mempertemukan kebutuhan UMKM dan
              kemampuan mahasiswa.
            </p>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">

            {/* Mahasiswa */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD85E] font-bold text-[#101C36]">
                M
              </div>

              <h3 className="text-2xl font-bold text-[#FFD85E]">
                Untuk Mahasiswa
              </h3>

              <p className="mt-4 leading-7 text-white/70">
                Temukan proyek nyata, dapatkan pengalaman kerja, memperoleh
                penghasilan, dan membangun portofolio dari pekerjaan yang telah
                diselesaikan.
              </p>

            </div>

            {/* UMKM */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEDB9] font-bold text-[#101C36]">
                U
              </div>

              <h3 className="text-2xl font-bold text-[#FBEDB9]">
                Untuk UMKM
              </h3>

              <p className="mt-4 leading-7 text-white/70">
                Temukan mahasiswa dengan keterampilan digital untuk membantu
                desain konten, video pendek, data entry, media sosial, dan
                website sederhana.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section
        id="cara-kerja"
        className="bg-[#F6F6F4] px-8 py-20"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="font-semibold text-[#101C36]">
              Proses Sederhana
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#101C36]">
              Cara Kerja SkillBridge
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Step 1 */}
            <div className="rounded-3xl border border-[#E8E3D1] bg-white p-7 shadow-sm">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-xl font-bold text-[#101C36]">
                01
              </div>

              <h3 className="text-xl font-bold text-[#101C36]">
                UMKM Membuat Proyek
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                UMKM mengisi kebutuhan, anggaran, deadline, dan hasil pekerjaan
                yang diinginkan.
              </p>

            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-[#E8E3D1] bg-white p-7 shadow-sm">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-xl font-bold text-[#101C36]">
                02
              </div>

              <h3 className="text-xl font-bold text-[#101C36]">
                Mahasiswa Melamar
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                Mahasiswa melihat proyek sesuai skill kemudian mengirimkan
                lamaran kepada UMKM.
              </p>

            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-[#E8E3D1] bg-white p-7 shadow-sm">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101C36] text-xl font-bold text-[#FFD85E]">
                03
              </div>

              <h3 className="text-xl font-bold text-[#101C36]">
                Proyek Diselesaikan
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                Mahasiswa mengerjakan proyek, UMKM memeriksa hasil, lalu
                pekerjaan dapat menjadi portofolio terverifikasi.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* Contoh Proyek */}
      <section
        id="proyek"
        className="bg-[#FBEDB9] px-8 py-20"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="font-semibold text-[#101C36]">
              Peluang Nyata
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#101C36]">
              Contoh Micro-Project
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Project 1 */}
            <div className="rounded-3xl border border-[#E4D69C] bg-[#F6F6F4] p-6 shadow-sm">

              <span className="inline-block rounded-full bg-[#FFD85E] px-3 py-1 text-sm font-semibold text-[#101C36]">
                Desain Grafis
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                5 Desain Feed Instagram
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                Membuat desain promosi sederhana untuk UMKM kuliner.
              </p>

              <div className="mt-6 border-t border-[#DDD8C7] pt-5">
                <p className="text-sm text-[#303030]/60">
                  Budget
                </p>

                <p className="mt-1 text-lg font-bold text-[#101C36]">
                  Rp150.000
                </p>
              </div>

            </div>

            {/* Project 2 */}
            <div className="rounded-3xl border border-[#E4D69C] bg-[#F6F6F4] p-6 shadow-sm">

              <span className="inline-block rounded-full bg-[#FFD85E] px-3 py-1 text-sm font-semibold text-[#101C36]">
                Video
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                Edit Video Produk
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                Edit video pendek 30–60 detik untuk TikTok atau Instagram.
              </p>

              <div className="mt-6 border-t border-[#DDD8C7] pt-5">
                <p className="text-sm text-[#303030]/60">
                  Budget
                </p>

                <p className="mt-1 text-lg font-bold text-[#101C36]">
                  Rp100.000
                </p>
              </div>

            </div>

            {/* Project 3 */}
            <div className="rounded-3xl border border-[#E4D69C] bg-[#F6F6F4] p-6 shadow-sm">

              <span className="inline-block rounded-full bg-[#FFD85E] px-3 py-1 text-sm font-semibold text-[#101C36]">
                Website
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                Landing Page Sederhana
              </h3>

              <p className="mt-3 leading-7 text-[#303030]/70">
                Membuat halaman informasi sederhana untuk usaha lokal.
              </p>

              <div className="mt-6 border-t border-[#DDD8C7] pt-5">
                <p className="text-sm text-[#303030]/60">
                  Budget
                </p>

                <p className="mt-1 text-lg font-bold text-[#101C36]">
                  Rp300.000
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F6F6F4] px-8 py-20">

        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#101C36] px-8 py-14 text-center">

          <p className="font-semibold text-[#FFD85E]">
            Mulai dari proyek pertama
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold text-white">
            Bangun pengalaman mahasiswa dan bantu UMKM tumbuh secara digital.
          </h2>

          <div className="mt-8 flex justify-center gap-4">

            <Link
              href="/register"
              className="rounded-xl bg-[#FFD85E] px-7 py-3 font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
            >
              Daftar Sekarang
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Masuk
            </Link>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] px-8 py-8 text-center text-[#F6F6F4]/70">

        <p>
          © 2026 SkillBridge UMKM — Menghubungkan Mahasiswa dan UMKM
        </p>

      </footer>

    </main>
  );
}