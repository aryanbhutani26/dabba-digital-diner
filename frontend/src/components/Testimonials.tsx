import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely amazing experience! The food was exquisite and the service was impeccable. The ambiance made our anniversary dinner truly special.",
      date: "2024-11-15",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment: "Best Indian restaurant in the city! The flavors are authentic and the presentation is beautiful. Highly recommend the tiffin service for daily meals.",
      date: "2024-11-10",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      comment: "The online ordering system is so convenient! Food arrived hot and fresh. The delivery tracking feature is a game-changer. Will definitely order again!",
      date: "2024-11-08",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    },
    {
      name: "David Thompson",
      rating: 5,
      comment: "Exceptional dining experience from start to finish. The chef's special was outstanding. Perfect for both casual dining and special occasions.",
      date: "2024-11-05",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
    },
    {
      name: "Priya Patel",
      rating: 5,
      comment: "Finally found a restaurant that serves authentic Indian cuisine! The spices are perfectly balanced and the portions are generous. Love it!",
      date: "2024-11-01",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    },
    {
      name: "James Wilson",
      rating: 5,
      comment: "Great atmosphere, friendly staff, and delicious food. The reservation system made booking so easy. Can't wait to come back!",
      date: "2024-10-28",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
    }
  ]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <div className="flex gap-1 mt-1">{renderStars(testimonial.rating)}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  "{testimonial.comment}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(testimonial.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Google Reviews Link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            See more reviews on Google
          </p>
          <a
            href="https://www.google.com/search?q=indiya+bar+%26+restaurant+restaurant+reviews&sca_esv=18cf15322796edcc&sxsrf=AE3TifOG-XFQJUXl_GIejHNkcUxR8icusg%3A1763815904532&ei=4LEhacqZIKyYseMPh5DkmQU&ved=0ahUKEwjKicGj5oWRAxUsTGwGHQcIOVMQ4dUDCBE&uact=5&oq=indiya+bar+%26+restaurant+restaurant+reviews&gs_lp=Egxnd3Mtd2l6LXNlcnAiKmluZGl5YSBiYXIgJiByZXN0YXVyYW50IHJlc3RhdXJhbnQgcmV2aWV3czIIEAAYCBgNGB4yCxAAGIAEGIYDGIoFMggQABiABBiiBDIFEAAY7wUyCBAAGIAEGKIEMgUQABjvBTIIEAAYgAQYogRI9H5Q0iBYn31wBngBkAEBmAHHAqAB9SGqAQcwLjguOC4zuAEDyAEA-AEBmAIVoAK_HMICBhAAGAoYHsICCBAAGAUYDRgewgIFEAAYgATCAgoQIRigARjDBBgKmAMA4gMFEgExIECSBwc2LjYuNi4zoAfrkAGyBwcwLjYuNi4zuAeHHMIHCDAuMS4xNy4zyAd8&sclient=gws-wiz-serp#lrd=0x47d8ad00417fcdd7:0xb63579faf0baf978,1,,,,"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <img
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
              alt="Google"
              className="h-6"
            />
            View on Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
};
