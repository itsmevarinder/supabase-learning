"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export interface SimilarProjectRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
}

interface SimilarProjectsSliderProps {
  projects: SimilarProjectRow[];
}

export function SimilarProjectsSlider({ projects }: SimilarProjectsSliderProps) {
  if (projects.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold">Similar Ministries</h2>

      <Carousel opts={{ align: "start", loop: projects.length > 4 }} className="mt-8 w-full">
        <CarouselContent className="-ml-4">
          {projects.map((project) => (
            <CarouselItem key={project.id} className="basis-full pl-4 lg:basis-1/4">
              <Link
                href={`/portfolio/${project.id}`}
                className="group block overflow-hidden rounded-3xl border bg-background shadow-sm transition-shadow duration-300 hover:shadow-2xl"
              >
                <div className="relative h-62 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="text-sm font-medium text-primary">{project.category}</span>
                  <h3 className="mt-1 text-lg font-semibold">{project.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View ministry
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </div>
  );
}
