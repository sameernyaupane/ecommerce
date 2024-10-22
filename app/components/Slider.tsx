import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function Slider() {
  return (
    <Carousel
    className='mt-[2rem]'
  >
    <CarouselContent>
      <CarouselItem
        key="1"
        className='flex justify-center items-center'
      >
        <div className='p-1 w-[1200px]'>
          <Card className='h-[400px]'>
            <CardContent className='flex items-center justify-center p-6'>
              <div className="absolute top-10 left-32 z-10 p-6 text-white">
                <h2 className='text-5xl font-semibold mb-2'>Transform Your Look</h2>
                <p className='text-xl font-medium'>Explore <strong>INDIBE Marketplace</strong> for <br /> Exclusive Beauty Discoveries!</p>
              </div>
              <img 
                src="/images/carousel/backgroundsliderimage.png" 
                className="w-full h-full object-cover scale-200 transform origin-center"
              />
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious className='absolute left-[2rem] top-1/2 transform -translate-y-1/2 z-10' />
    <CarouselNext className='absolute right-[2rem] top-1/2 transform -translate-y-1/2 z-10' />
  </Carousel>
  );
}

export default Slider;

