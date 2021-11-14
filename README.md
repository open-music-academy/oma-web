# website

The openmusic.academy website

## Local development:

### Linting commands

~~~sh
gulp lint // Will run eslint
gulp fix  // Will run eslint and fix any linting rules that are easily solvable.
          // ATTENTION: commit your work before running this command.
~~~

### Tunnelling

~~~sh
// Make sure to set correct values for these env variables:

export TUNNEL_TOKEN='43nv9zj935tmzmx4'
export TUNNEL_WEBSITE_DOMAIN='mytunneldomain.com'
export TUNNEL_WEBSITE_CDN_DOMAIN='cdn.mytunneldomain.com'

// Start the tunnel:
gulp tunnel
~~~

## License

Open Music Academy is released under the MIT License. See the bundled LICENSE file for details.
