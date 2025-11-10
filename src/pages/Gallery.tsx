import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Placeholder images - in a real app, these would be actual gallery photos
  const galleryImages = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
      title: "Signature Dish",
      category: "Food",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      title: "Elegant Dining Space",
      category: "Interior",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
      title: "Gourmet Plating",
      category: "Food",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      title: "Bar Area",
      category: "Interior",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
      title: "Dessert Selection",
      category: "Food",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&h=600&fit=crop",
      title: "Chef at Work",
      category: "Staff",
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&h=600&fit=crop",
      title: "Wine Selection",
      category: "Drinks",
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop",
      title: "Private Dining",
      category: "Interior",
    },
    {
      id: 9,
      url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
      title: "Fresh Salad",
      category: "Food",
    },
  ];

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-[4/3] bg-muted"
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-accent text-sm font-medium mb-1">{image.category}</p>
                    <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          {selectedImage !== null && (
            <div className="relative">
              <img
                src={galleryImages[selectedImage].url}
                alt={galleryImages[selectedImage].title}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-accent text-sm font-medium mb-1">
                  {galleryImages[selectedImage].category}
                </p>
                <h3 className="text-white text-2xl font-semibold">
                  {galleryImages[selectedImage].title}
                </h3>
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
