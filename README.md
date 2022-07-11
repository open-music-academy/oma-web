# oma-web

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
// Make sure to set correct values for these environment variables:

export TUNNEL_TOKEN='43nv9zj935tmzmx4'
export TUNNEL_WEBSITE_DOMAIN='mytunneldomain.com'
export TUNNEL_WEBSITE_CDN_DOMAIN='cdn.mytunneldomain.com'

// Start the tunnel:
gulp tunnel
~~~

## OERSI integration

The `ambConfig` setup serves as configuration for integrating OMA into the OERSI platform.

https://oersi.org/resources/?provider=%5B%22Open+Music+Academy%22%5D

## License

Open Music Academy is released under the MIT License. See the bundled LICENSE file for details.

---

## OER learning platform for music

Funded by 'Stiftung Innovation in der Hochschullehre'

<img src="https://stiftung-hochschullehre.de/wp-content/uploads/2020/07/logo_stiftung_hochschullehre_screenshot.jpg)" alt="Logo der Stiftung Innovation in der Hochschullehre" width="200"/>

A Project of the 'Hochschule für Musik und Theater München' (University for Music and Performing Arts)

<img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Logo_Hochschule_f%C3%BCr_Musik_und_Theater_M%C3%BCnchen_.png" alt="Logo der Hochschule für Musik und Theater München" width="200"/>

Project owner: Bernd Redmann\
Project management: Ulrich Kaiser
