# This is the root of our app
@root = File.expand_path(File.dirname(__FILE__))

run Proc.new { |env|
  # Extract the requested path from the request
  path = Rack::Utils.unescape(env['PATH_INFO'])
  index_file = @root + "#{path}/index.html"

  if File.exists?(index_file)
puts "Returning index.html..."
    # Return the index
    [200, {'Content-Type' => 'text/html'}, File.open(index_file, File::RDONLY)]
  else
    # Pass the request to the directory app
    Rack::Directory.new(@root).call(env)
  end
}
