import Header from "@/components/shadn/header";
import HeroSection from "@/components/shadn/HeroSection";
import TrustedBy from "@/components/shadn/TrustedBy";
import AboutSection from "@/components/shadn/AboutSection";
import VideoSection from "@/components/shadn/VideoSection";
import AudioSection from "@/components/shadn/AudioSection";
import PortfolioSection from "@/components/shadn/PortfolioSection";
import GallerySection from "@/components/shadn/GallerySection";
import FAQSection from "@/components/shadn/Accordion";
import DonateSection from "@/components/shadn/DonateSection";
import TestimonialSection from "@/components/shadn/TestimonialSection";
import EventsSection from "@/components/shadn/EventsSection";
import ContactSection from "@/components/shadn/Contact";
import Footer from "@/components/shadn/footer";
import ScrollFlipBackground from "@/components/shadn/ScrollFlipBackground";
import QRCode from "qrcode";
import { getAboutSection, getAudioSection, getAudioTracks, getDonateSection, getEvents, getEventsSection, getFaqs, getGalleryItems, getHeroBanners, getPortfolioProjects, getSiteSettings, getTestimonials, getVideoSection } from "@/lib/supabase/server";
import { buildUpiPaymentString } from "@/lib/upi";

const Page = async () => {
   const [heroBanners, portfolioProjects, donateSection, siteSettings, testimonials, faqs, aboutSection, videoSection, events, galleryItems, audioTracks, eventsSection, audioSection] = await Promise.all([
      getHeroBanners(),
      getPortfolioProjects(),
      getDonateSection(),
      getSiteSettings(),
      getTestimonials(),
      getFaqs(),
      getAboutSection(),
      getVideoSection(),
      getEvents(),
      getGalleryItems(),
      getAudioTracks(),
      getEventsSection(),
      getAudioSection(),
   ]);

   const donateQrCodeDataUrl = donateSection?.phone_number
      ? await QRCode.toDataURL(buildUpiPaymentString(donateSection.phone_number, "Aurora Donation"))
      : null;

   return (
      <main className="overflow-x-clip">
         <ScrollFlipBackground />
         <Header showLoginButton={siteSettings?.show_login_button ?? true} />
         <HeroSection banners={heroBanners} />
         <TrustedBy />
         <AboutSection about={aboutSection} />
         <PortfolioSection projects={portfolioProjects} />
         <GallerySection items={galleryItems} />
         <DonateSection donate={donateSection} qrCodeDataUrl={donateQrCodeDataUrl} />
         <FAQSection faqs={faqs} />
         <AudioSection tracks={audioTracks} backgroundImageUrl={audioSection?.background_image_url} />
         <VideoSection video={videoSection} />
         <EventsSection events={events} backgroundImageUrl={eventsSection?.background_image_url} />
         <TestimonialSection testimonials={testimonials} />
         <ContactSection settings={siteSettings} />
         <Footer settings={siteSettings} />
      </main>
   );
};

export default Page;