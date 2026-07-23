import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HeroBannerForm } from "@/components/dashboard/hero-banner-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function AdminHeroBannersPage() {

   return (
      <div className="space-y-8">
         <PageHeader>
            <div className="flex justify-between">
               <div>
                  <h1 className="text-2xl font-bold">Add Banners</h1>
                  <p className="text-muted-foreground">
                     Slides shown in the homepage hero carousel. Inactive banners are kept but hidden.
                  </p>
               </div>
               <Link href={`/admin/hero-banners`}>
                  <Button variant="ghost" className="-ml-4"><ArrowLeft /> Back to Hero Banners</Button>
               </Link>
            </div>
         </PageHeader>

         <Card>
            <CardHeader>
               <CardTitle className="text-lg">Add a banner</CardTitle>
            </CardHeader>
            <CardContent>
               <HeroBannerForm />
            </CardContent>
         </Card>
      </div>
   );
}
