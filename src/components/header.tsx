export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-[#f3ede7] dark:border-[#2d241d] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-primary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "FILL 1" }}
              >
                pets
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Pixel Dog</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">
              Gallery
            </a>
            <a
              className="text-sm font-medium text-[#9a734c] hover:text-primary transition-colors"
              href="#"
            >
              Impact
            </a>
            <a
              className="text-sm font-medium text-[#9a734c] hover:text-primary transition-colors"
              href="#"
            >
              Transparency
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9a734c] text-xl">
              search
            </span>
            <input
              className="bg-[#f3ede7] dark:bg-[#2d241d] border-none rounded-full py-2 pl-10 pr-4 text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Find a pet..."
              type="text"
            />
          </div>
          <button
            className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span className="hidden sm:inline">Donate &amp; Upload</span>
          </button>
          <div
            className="size-9 rounded-full bg-cover bg-center border-2 border-primary/20"
            data-alt="User profile avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBb75NAjYh5EyGSC8WellRvCpLeq_GlKsxRShKDXoKGMusAwZIVlZcCl6FrMzhCAzxVQkMBk8N-9pI33z5xrZ_HDO8z4Gd9b4izZmh11gE2Hqh-FHFSkt0FT-0Cz1e7AzGQdKApKE6ILshZ8CNwGLZF40H22ZPYNASTdCxnSLKE-czFgn2bjO4CR3HmiHxkrsM347VrerbJ7T0YcmbQLSulbcsvncoqDoKAzhZRvIu2dlSO6YkM8xsxxr-iU16iAfC56clGH4E0adz4")',
            }}
          />
        </div>
      </div>
    </header>
  );
}
