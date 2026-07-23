import Header from "@/components/shadn/header";
import HeroSection from "@/components/shadn/HeroSection";
import TrustedBy from "@/components/shadn/TrustedBy";
import AboutSection from "@/components/shadn/AboutSection";
import VideoSection from "@/components/shadn/VideoSection";
import AudioSection from "@/components/shadn/AudioSection";
import PortfolioSection from "@/components/shadn/PortfolioSection";
import GallerySection from "@/components/shadn/GallerySection";
import FAQSection from "@/components/shadn/Accordion";
import PricingSection from "@/components/shadn/PricingSection";
import TestimonialSection from "@/components/shadn/TestimonialSection";
import EventsSection from "@/components/shadn/EventsSection";
import ContactSection from "@/components/shadn/Contact";
import Footer from "@/components/shadn/footer";
import ScrollFlipBackground from "@/components/shadn/ScrollFlipBackground";
import { getAboutSection, getAudioTracks, getEvents, getFaqs, getGalleryItems, getHeroBanners, getPortfolioProjects, getPricingPlans, getSiteSettings, getTestimonials, getVideoSection } from "@/lib/supabase/server";

const Page = async () => {
   const [heroBanners, portfolioProjects, pricingPlans, siteSettings, testimonials, faqs, aboutSection, videoSection, events, galleryItems, audioTracks] = await Promise.all([
      getHeroBanners(),
      getPortfolioProjects(),
      getPricingPlans(),
      getSiteSettings(),
      getTestimonials(),
      getFaqs(),
      getAboutSection(),
      getVideoSection(),
      getEvents(),
      getGalleryItems(),
      getAudioTracks(),
   ]);

   return (
      <main className="overflow-x-clip">
         <ScrollFlipBackground />
         <Header showLoginButton={siteSettings?.show_login_button ?? true} />
         <HeroSection banners={heroBanners} />
         <TrustedBy />
         <AboutSection about={aboutSection} />
         <PortfolioSection projects={portfolioProjects} />
         <GallerySection items={galleryItems} />
         <EventsSection events={events} />
         <AudioSection tracks={audioTracks} />
         <PricingSection plans={pricingPlans} />
         <FAQSection faqs={faqs} />
         <VideoSection video={videoSection} />
         <TestimonialSection testimonials={testimonials} />
         <ContactSection settings={siteSettings} />
         <Footer settings={siteSettings} />
      </main>
   );
};

export default Page;