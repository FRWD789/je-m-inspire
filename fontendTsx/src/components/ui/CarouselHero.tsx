import * as React from "react"
import {ArrowRight} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselHero() {
  return (
    

    
        <Carousel
          opts={{
            align: "start",
          }}
          orientation="horizontal"
          className="w-full "
        >  
        <div className="flex justify-between w-full items-center mb-[8px]">
            <div className="flex gap-x-[4px] lin w-full items-center">
                <span>Explorer tous </span>
                <ArrowRight className="h-4"/>
            </div>    
            <div className="flex gap-x-2 w-full justify-end  ">
                 <CarouselPrevious />
                <CarouselNext />
            </div>
        </div>
          <CarouselContent className="-mt-1 ">
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="pt-1 md:basis-1/4">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-between ">
                      
                        <img src="assets/img/card-img.jpg" alt="" />
                        <div className="px-[12px] py-[8px] grid gap-y-[16px] ">
                            <div className="grid gap-y-[6px]">
                                <h4>
                                    Atelier Holistique
                                </h4>
                                <p>
                                    sun,sep 14, 1:00 PM
                                    Sherbrooke, Qc
        
                                </p>
                            </div>
                            <h5 className="font-black">Free</h5>
    
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        
    
        </Carousel>

  )
}
