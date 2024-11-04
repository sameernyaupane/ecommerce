import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function Slider() {
  return (
    <Carousel className='my-[2rem]'>
      <CarouselContent>
        <CarouselItem
          key="1"
          className='flex justify-center items-center'
        >
          <div className='w-[1200px]'>
            <div className='h-[400px] relative'>
              <div className="absolute top-10 left-[50px] z-10 p-6 text-white">
                <h2 className='text-5xl font-semibold mb-2'>Transform Your Look</h2>
                <p className='text-xl font-medium'>Explore <strong>INDIBE Marketplace</strong> for <br /> Exclusive Beauty Discoveries!</p>
              </div>
              <div className='w-full h-full relative'>
                <img 
                  src="/images/carousel/backgroundsliderimage.png" 
                  className="w-full h-full object-cover scale-200 transform origin-center"
                />
                <CarouselPrevious className='absolute left-4 top-1/2 -translate-y-1/2 z-20' />
                <CarouselNext className='absolute right-4 top-1/2 -translate-y-1/2 z-20' />
              </div>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

export default Slider;

