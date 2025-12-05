import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Indiya Bar & Restaurant's website and services, you accept and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Services</h2>
              <p>We provide:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Online food ordering and delivery services</li>
                <li>Table reservation services</li>
                <li>Tiffin/Dabba subscription services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Orders and Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All orders are subject to availability</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made at the time of order</li>
                <li>We accept major credit cards and online payment methods</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Delivery</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Delivery fees apply based on location</li>
                <li>Minimum order value may apply for delivery</li>
                <li>We are not responsible for delays due to weather or traffic</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cancellations and Refunds</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders can be cancelled within 5 minutes of placement</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>Reservations can be cancelled up to 24 hours in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining account security</li>
                <li>You must provide accurate information</li>
                <li>We reserve the right to suspend or terminate accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, and images, is the property of Indiya Bar & Restaurant and protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
              <p>
                We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
              <p>
                For questions about these Terms & Conditions, contact us at:
                <br />
                Email: DineIndiyaRestaurant@gmail.com
                <br />
                Phone: +44 (0)1689451403
                <br />
                Address: Indiya Restaurant, 180 High Street, Orpington, BR6 0JW, United Kingdom
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
