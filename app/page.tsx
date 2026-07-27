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
import NewsletterSection from "@/components/shadn/NewsletterSection";
import ContactSection from "@/components/shadn/Contact";
import Footer from "@/components/shadn/footer";
import ScrollFlipBackground from "@/components/shadn/ScrollFlipBackground";
import SmoothScroll from "@/components/shadn/SmoothScroll";
import { getAboutSection, getAudioSection, getAudioTracks, getDonateSection, getEvents, getEventsSection, getFaqs, getGalleryItems, getHeroBanners, getNewsletterSection, getPortfolioProjects, getSiteSettings, getTestimonials, getVideoSection } from "@/lib/supabase/server";

export const metadata = {
   title: "CMS Homepage",
};

const Page = async () => {
   const [heroBanners, portfolioProjects, donateSection, siteSettings, testimonials, faqs, aboutSection, videoSection, events, galleryItems, audioTracks, eventsSection, audioSection, newsletterSection] = await Promise.all([
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
      getNewsletterSection(),
   ]);

   return (
      <main className="overflow-x-clip">
         <SmoothScroll />
         <ScrollFlipBackground />
         <Header showLoginButton={siteSettings?.show_login_button ?? true} />
         <HeroSection banners={heroBanners} />
         <TrustedBy />
         <AboutSection about={aboutSection} />
         <PortfolioSection projects={portfolioProjects.slice(0, 5)} />
         <GallerySection items={galleryItems.slice(0, 12)} viewAllHref="/gallery" />
         <DonateSection donate={donateSection} />
         <FAQSection faqs={faqs} />
         <AudioSection tracks={audioTracks} backgroundImageUrl={audioSection?.background_image_url} />
         <VideoSection video={videoSection} />
         <EventsSection events={events} backgroundImageUrl={eventsSection?.background_image_url} />
         <TestimonialSection testimonials={testimonials} />
         <NewsletterSection backgroundImageUrl={newsletterSection?.background_image_url} />
         <ContactSection settings={siteSettings} />
         <Footer settings={siteSettings} />
      </main>
   );
};

export default Page;