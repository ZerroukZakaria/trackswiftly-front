export default [

  {
    title: 'Telematics Center',
    icon: { icon: 'tabler-sitemap' },
    children: [

      {
        title: 'Vehicles',
        icon: { icon: 'tabler-car' },
        to: 'vehicles-list'


      },
      {
        title: 'Devices',
        icon: { icon: 'tabler-router' },
        to: 'devices-list'


      },

      {
        title: 'POI',
        icon: { icon: 'tabler-map-pins' },
        to: 'poi-list'
      },
    ]
  }

]
