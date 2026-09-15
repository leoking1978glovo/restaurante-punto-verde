export function JsonLd() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Restaurante Punto Verde",
      image: "https://www.restaurantpuntoverde.es/og-image.jpg",
      url: "https://www.restaurantpuntoverde.es/",
      telephone: "+34 950 67 45 42",
      priceRange: "€10-20",
      servesCuisine: ["Colombiana", "Latinoamericana"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Calle Miguel Rúa, 64",
        addressLocality: "Almería",
        addressRegion: "Andalucía",
        postalCode: "04007",
        addressCountry: "ES",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "12:00",
          closes: "16:30",
        },
      ],
    };
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }