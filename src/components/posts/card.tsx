type PostCardProps = {
  image: string;
  alt: string;
  amountDonated: number;
};

export default function PostCard({ image, alt, amountDonated }: PostCardProps) {
  return (
    <article className="masonry-item animate__animated animate__fadeInRight animate__delay-1s">
      <div className="relative group rounded-xl overflow-hidden cursor-zoom-in">
        <img
          alt={alt}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-alt={alt}
          src={image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <div className="flex justify-between items-center text-white">
            <span className="font-bold">Buddy</span>
            <div className="flex items-center gap-1 bg-primary text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
              ${amountDonated.toFixed(2)} Donated
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="bg-white/90 backdrop-blur size-8 rounded-full flex items-center justify-center text-red-500"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "FILL 1" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
