const BlogContent = () => {
  return (
    <article className="py-16 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light leading-tight text-foreground mb-8">
            The Importance of a Strong Brand Positioning
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut 
            odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro 
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
          </p>
        </div>
        
        <div className="mb-12">
          <div className="w-full h-96 bg-muted rounded-lg overflow-hidden mb-8">
            <img 
              src="/lovable-uploads/c6a49bfb-8102-44c3-a240-7e2b4e6ec0ea.png" 
              alt="Brand positioning illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Elit ullamcorper dignissim
          </h2>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit, urna consequat felis vehicula class ultricies mollis 
              dictumst, aenean non a in donec nulla. Phasellus ante pellentesque erat cum risus consequat imperdiet aliquam, 
              integer placerat et turpis mi eros nec lobortis taciti, vehicula nisl litora tellus ligula porttitor metus.
            </p>
            
            <p>
              Vivamus integer non suscipit taciti mus etiam at primis tempor sagittis sit, euismod libero facilisi aptent 
              elementum felis blandit cursus gravida sociis erat ante, eleifend lectus nullam dapibus netus feugiat curae 
              curabitur est ad. Massa curae fringilla porttitor quam sollicitudin iaculis aptent leo ligula euismod dictumst, 
              orci penatibus mauris eros etiam praesent erat volutpat posuere hac.
            </p>
            
            <p>
              Malesuada velit feugiat est consectetur mauris molestie augue rutrum imperdiet consectetur, pulvinar fusce 
              dictum et duis mollis a ad rutrum mi.
            </p>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mt-12 mb-6">
            Hendrerit dolor magna
          </h3>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Hendrerit consequat tempor est vehicula ultricies et tempor laoreet condimentum blandit mollis molestie, 
              aliquam est vehicula hendrerit facilisis faucibus risus venenatis vulputate pulvinar. Rutrum phasellus molestie 
              libero imperdiet mauris donec vulputate blandit, aliquam mauris fermentum venenatis facilisis massa accumsan, 
              varius bibendum est non ullamcorper quam dis.
            </p>
            
            <p>
              Placerat lorem consectetur molestie cursus vulputate taciti vehicula lobortis erat rutrum quam, quis eleifend 
              mauris aliquam condimentum mauris a bibendum praesent sodales mollis.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogContent;