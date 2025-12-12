import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const data = await api.getGalleryItems();
      setGalleryItems(data);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
      // Fallback to empty array if API fails
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Our Gallery</h1>
            <p className="text-xl text-muted-foreground">
              A visual journey through Indiya Bar & Restaurant's culinary artistry and elegant ambiance
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-4">Gallery Coming Soon</h3>
              <p className="text-muted-foreground">
                We're preparing beautiful images to showcase our restaurant. Please check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((image, index) => (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-[4/3] bg-muted"
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-accent text-sm font-medium mb-1">{image.category}</p>
                      <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                      {image.description && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-2">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          {selectedImage !== null && galleryItems[selectedImage] && (
            <div className="relative">
              <img
                src={galleryItems[selectedImage].imageUrl}
                alt={galleryItems[selectedImage].title}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-accent text-sm font-medium mb-1">
                  {galleryItems[selectedImage].category}
                </p>
                <h3 className="text-white text-2xl font-semibold">
                  {galleryItems[selectedImage].title}
                </h3>
                {galleryItems[selectedImage].description && (
                  <p className="text-white/80 text-base mt-2">
                    {galleryItems[selectedImage].description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
