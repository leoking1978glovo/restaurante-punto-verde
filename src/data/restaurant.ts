import carneCriolla from "@/assets/Carne-en-salsa-criolla.jpg";
import sancochodegallina from "@/assets/dish-sancocho-de-gallina.jpg";
import maduroconqueso from "@/assets/dish-maduro-con-queso.jpg";
import tamalcolombiano from "@/assets/dish-tamal-colombiano.jpg";
import bandejapaisa from "@/assets/dish-bandeja-paisa.jpg";

export type Dish = {
  name: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
};

export const dishes: Dish[] = [
  {
    name: "Carne en salsa criolla",
    description: "Carne tierna cocinada lentamente en una sabrosa salsa criolla.",
    price: "14,50 €",
    image: carneCriolla,
  },
  
  {
    name: "Sancocho de gallila",
    description: "trozos de gallina criolla, plátano verde, yuca, mazorca (choclo) y papa, cocinados en un caldo aromático con ajo, cebolla y cilantro.",
    price: "12,00 €",
    image: sancochodegallina,
  },
  {
    name: "maduro con queso",
    description: "plato tradicional latinoamericano que combina el dulzor intenso del plátano macho cocido con la nota salada y textura fundente del queso.",
    price: "16,90 €",
    image: maduroconqueso,
  },
  {
    name: "tamal colombiano",
    description: "carnes de cerdo y pollo, papa y arvejas, sin llevar arroz.",
    price: "8,50 €",
    image: tamalcolombiano,
  },
  {
    name: "Bandeja Paisa",
    description: "PLato colombiano que lleva, arroz blanco, carne moida, chicharron, chorizo, huevo frito, platano maduro, aguacate, arepa.",
    price: "7,90 €",
    image: bandejapaisa,
  },
];

export type MenuItemChoice = {
  label: string;
  options: string[];
};

export type MenuCategory = {
  title: string;
  items: {
    name: string;
    description: string;
    price: string;
    choices?: MenuItemChoice[];
  }[];
};

export const menu: MenuCategory[] = [
  {
    title: "Desayunos",
    items: [
      { name: "Calentado con chicharrón, arepa y queso", description: "", price: "10.00\u00A0€" },
      { name: "Calentado con chorizo, arepa y queso", description: "", price: "8.00\u00A0€" },
      { name: "Calentado con huevos pericos, arepa y queso", description: "", price: "7.00\u00A0€" },
      { name: "Chorizo, huevos pericos, arepa y queso", description: "", price: "6.50\u00A0€" },
      { name: "Morcilla con arepa", description: "", price: "8.00\u00A0€" },
      { name: "Huevos pericos, arepa y queso", description: "", price: "5.50\u00A0€" },
      { name: "Pandebono", description: "", price: "1.60\u00A0€" },
    ],
  },
  {
    title: "Adicionales",
    items: [
      { name: "Chorizo", description: "", price: "1.50\u00A0€" },
      { name: "Huevos pericos", description: "", price: "2.50\u00A0€" },
      { name: "Huevos fritos", description: "", price: "1.00\u00A0€" },
      { name: "Aguacate", description: "", price: "1.00\u00A0€" },
      { name: "Arepa tela", description: "", price: "1.20\u00A0€" },
      { name: "Arepa pequeña", description: "", price: "0.60\u00A0€" },
    ],
  },
  {
    title: "Menú del día",
    items: [
      {
        name: "Arroz, frijoles, ensalada, papa a la francesa, sopa, proteína y bebida",
        description: "A elección y disponibilidad. Proteína: chicharrón, churrasco, costillas BBQ, pollo broster, cerdo o pollo a la plancha. Bebidas: coca cola, fanta, aquarius, agua de panela o agua.",
        price: "12.00\u00A0€",
        choices: [
          {
            label: "Elige tu proteína",
            options: [
              "Chicharrón",
              "Churrasco",
              "Costillas BBQ",
              "Pollo broster",
              "Pollo a la plancha",
            ],
          },
          {
            label: "Elige tu bebida",
            options: ["Coca Cola", "Fanta", "Aquarius", "Agua de panela", "Agua"],
          },
        ],
      },
      { name: "Menú infantil", description: "Pollo broster o nuggets (a elección y/o disponibilidad), papa francesa y helado.", price: "8.00\u00A0€" },
    ],
  },
  {
    title: "A la carta",
    items: [
      { name: "Bandeja paisa", description: "", price: "14.50\u00A0€" },
      { name: "Sobre barriga en salsa", description: "", price: "13.50\u00A0€" },
      { name: "Lengua en salsa", description: "", price: "13.50\u00A0€" },
      { name: "Pescado frito", description: "De acuerdo al tamaño desde 14.00€ a 18.00€", price: "18.00\u00A0€" },
      { name: "Chuleta valluna", description: "", price: "13.50\u00A0€" },
      { name: "Ternera a la plancha o en bistec", description: "", price: "13.50\u00A0€" },
      { name: "Mondongo", description: "Viernes y sábados. Sopa de callo, trocios de corto y costilla, patata, yuca, zanahoria cocida.", price: "14.00\u00A0€" },
      { name: "Tamal", description: "Envuelto en hoja de bijao, masa adobada de maíz, zanahoria, patata, proteínas, pollo, costilla, chicharrón y cerdo + porción de arroz.", price: "10.00\u00A0€" },
    ],
  },
  {
    title: "Especialidad fin de semana",
    items: [
      { name: "Sancocho de gallina", description: "", price: "13.00\u00A0€" },
      { name: "Sancocho de costilla", description: "", price: "14.00\u00A0€" },
      { name: "Sancocho mixto", description: "", price: "15.00\u00A0€" },
    ],
  },
  {
    title: "Raciones / Porciones",
    items: [
      { name: "Chicharrón con arepa o patacón o papa frita", description: "", price: "8.00\u00A0€" },
      { name: "Churrasco con arepa o patacón o papa frita", description: "", price: "10.00\u00A0€" },
      { name: "Maduro con queso", description: "", price: "6.50\u00A0€" },
      { name: "Porción de ensalada", description: "", price: "3.00\u00A0€" },
      { name: "Porción de patatas", description: "", price: "3.00\u00A0€" },
      { name: "Porción de arroz", description: "", price: "2.50\u00A0€" },
      { name: "Porción de tajada maduro", description: "", price: "3.00\u00A0€" },
      { name: "Ají adicional", description: "", price: "1.00\u00A0€" },
    ],
  },
  {
    title: "Entradas y para compartir",
    items: [
      { name: "Empanadas", description: "", price: "1.80\u00A0€" },
      { name: "Patacones con guiso", description: "", price: "4.00\u00A0€" },
      { name: "Patacones con queso y guiso", description: "", price: "5.50\u00A0€" },
      { name: "Picada de chorizo, morcilla y papa vapor", description: "", price: "8.00\u00A0€" },
    ],
  },
  {
    title: "Bebidas y jugos naturales",
    items: [
      { name: "Café", description: "", price: "1.20\u00A0€" },
      { name: "Café con leche", description: "", price: "1.50\u00A0€" },
      { name: "Milo frío o caliente", description: "", price: "4.00\u00A0€" },
      { name: "Chocolate", description: "", price: "2.50\u00A0€" },
      { name: "Gaseosa manzana - uva - colombiana malta", description: "", price: "2.80\u00A0€" },
      { name: "Coca cola - fanta - aquarius", description: "", price: "2.30\u00A0€" },
      { name: "Borojó personal", description: "", price: "4.50\u00A0€" },
      { name: "Jugo natural agua personal", description: "", price: "3.50\u00A0€" },
      { name: "Jugo natural agua jarra", description: "", price: "6.00\u00A0€" },
      { name: "Jugo natural leche personal", description: "", price: "4.50\u00A0€" },
      { name: "Jugo natural leche jarra", description: "", price: "7.50\u00A0€" },
    ],
  },
  {
    title: "Cervezas",
    items: [
      { name: "Amstel botella", description: "", price: "2.50\u00A0€" },
      { name: "Heineken - Corona - Alhambra", description: "", price: "3.50\u00A0€" },
      { name: "Cerveza cero", description: "", price: "3.00\u00A0€" },
    ],
  },
];