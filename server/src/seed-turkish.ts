import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const turkishFoods = [
  // Kebap & Izgara
  { name: 'Adana Kebap', caloriesPer100g: 250, proteinPer100g: 20, carbsPer100g: 3, fatPer100g: 18, defaultServingG: 200 },
  { name: 'Urfa Kebap', caloriesPer100g: 240, proteinPer100g: 19, carbsPer100g: 3, fatPer100g: 17, defaultServingG: 200 },
  { name: 'Şiş Kebap (kuzu)', caloriesPer100g: 220, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 14, defaultServingG: 200 },
  { name: 'Şiş Kebap (tavuk)', caloriesPer100g: 175, proteinPer100g: 25, carbsPer100g: 2, fatPer100g: 7, defaultServingG: 200 },
  { name: 'Döner Kebap (tavuk)', caloriesPer100g: 195, proteinPer100g: 22, carbsPer100g: 4, fatPer100g: 10, defaultServingG: 150 },
  { name: 'Döner Kebap (et)', caloriesPer100g: 265, proteinPer100g: 18, carbsPer100g: 4, fatPer100g: 20, defaultServingG: 150 },
  { name: 'İskender Kebap', caloriesPer100g: 210, proteinPer100g: 14, carbsPer100g: 12, fatPer100g: 13, defaultServingG: 300 },
  { name: 'Köfte (izgara)', caloriesPer100g: 245, proteinPer100g: 20, carbsPer100g: 5, fatPer100g: 16, defaultServingG: 150 },
  { name: 'Köfte (haşlama)', caloriesPer100g: 200, proteinPer100g: 18, carbsPer100g: 5, fatPer100g: 12, defaultServingG: 150 },
  { name: 'İçli Köfte', caloriesPer100g: 215, proteinPer100g: 10, carbsPer100g: 22, fatPer100g: 10, defaultServingG: 150 },
  { name: 'Çiğ Köfte', caloriesPer100g: 180, proteinPer100g: 5, carbsPer100g: 35, fatPer100g: 3, defaultServingG: 100 },
  { name: 'Patlıcan Kebap', caloriesPer100g: 160, proteinPer100g: 12, carbsPer100g: 8, fatPer100g: 10, defaultServingG: 250 },
  { name: 'Tandır Kebap', caloriesPer100g: 230, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 15, defaultServingG: 200 },
  { name: 'Beyti Kebap', caloriesPer100g: 240, proteinPer100g: 19, carbsPer100g: 10, fatPer100g: 15, defaultServingG: 250 },

  // Dolma & Sarma
  { name: 'Yaprak Sarma (zeytinyağlı)', caloriesPer100g: 165, proteinPer100g: 3, carbsPer100g: 22, fatPer100g: 7, defaultServingG: 150 },
  { name: 'Yaprak Sarma (etli)', caloriesPer100g: 195, proteinPer100g: 9, carbsPer100g: 18, fatPer100g: 10, defaultServingG: 150 },
  { name: 'Biber Dolma (zeytinyağlı)', caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 17, fatPer100g: 5, defaultServingG: 200 },
  { name: 'Biber Dolma (etli)', caloriesPer100g: 155, proteinPer100g: 8, carbsPer100g: 15, fatPer100g: 8, defaultServingG: 200 },
  { name: 'Domates Dolma', caloriesPer100g: 130, proteinPer100g: 6, carbsPer100g: 14, fatPer100g: 6, defaultServingG: 200 },
  { name: 'Patlıcan Dolma', caloriesPer100g: 125, proteinPer100g: 5, carbsPer100g: 13, fatPer100g: 6, defaultServingG: 200 },
  { name: 'Kabak Dolma', caloriesPer100g: 115, proteinPer100g: 5, carbsPer100g: 12, fatPer100g: 5, defaultServingG: 200 },

  // Börek & Hamur İşleri
  { name: 'Su Böreği', caloriesPer100g: 280, proteinPer100g: 11, carbsPer100g: 28, fatPer100g: 14, defaultServingG: 150 },
  { name: 'Sigara Böreği', caloriesPer100g: 320, proteinPer100g: 12, carbsPer100g: 30, fatPer100g: 18, defaultServingG: 100 },
  { name: 'Ispanaklı Börek', caloriesPer100g: 260, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 13, defaultServingG: 150 },
  { name: 'Peynirli Börek', caloriesPer100g: 295, proteinPer100g: 12, carbsPer100g: 27, fatPer100g: 16, defaultServingG: 150 },
  { name: 'Kıymalı Börek', caloriesPer100g: 305, proteinPer100g: 13, carbsPer100g: 26, fatPer100g: 17, defaultServingG: 150 },
  { name: 'Gözleme (peynirli)', caloriesPer100g: 255, proteinPer100g: 10, carbsPer100g: 30, fatPer100g: 11, defaultServingG: 200 },
  { name: 'Gözleme (kıymalı)', caloriesPer100g: 265, proteinPer100g: 12, carbsPer100g: 29, fatPer100g: 12, defaultServingG: 200 },
  { name: 'Gözleme (patatesli)', caloriesPer100g: 240, proteinPer100g: 6, carbsPer100g: 35, fatPer100g: 9, defaultServingG: 200 },
  { name: 'Pide (kıymalı)', caloriesPer100g: 250, proteinPer100g: 12, carbsPer100g: 30, fatPer100g: 9, defaultServingG: 250 },
  { name: 'Pide (peynirli)', caloriesPer100g: 265, proteinPer100g: 11, carbsPer100g: 31, fatPer100g: 11, defaultServingG: 250 },
  { name: 'Pide (yumurtalı)', caloriesPer100g: 240, proteinPer100g: 10, carbsPer100g: 29, fatPer100g: 10, defaultServingG: 250 },
  { name: 'Lahmacun', caloriesPer100g: 230, proteinPer100g: 10, carbsPer100g: 29, fatPer100g: 9, defaultServingG: 200 },
  { name: 'Simit', caloriesPer100g: 330, proteinPer100g: 10, carbsPer100g: 63, fatPer100g: 5, defaultServingG: 120 },
  { name: 'Poğaça (sade)', caloriesPer100g: 345, proteinPer100g: 8, carbsPer100g: 42, fatPer100g: 16, defaultServingG: 80 },
  { name: 'Poğaça (peynirli)', caloriesPer100g: 360, proteinPer100g: 11, carbsPer100g: 40, fatPer100g: 18, defaultServingG: 80 },
  { name: 'Açma', caloriesPer100g: 380, proteinPer100g: 8, carbsPer100g: 45, fatPer100g: 19, defaultServingG: 80 },

  // Çorbalar
  { name: 'Mercimek Çorbası', caloriesPer100g: 75, proteinPer100g: 5, carbsPer100g: 11, fatPer100g: 1.5, defaultServingG: 300 },
  { name: 'Ezogelin Çorbası', caloriesPer100g: 80, proteinPer100g: 4, carbsPer100g: 13, fatPer100g: 1.5, defaultServingG: 300 },
  { name: 'Tarhana Çorbası', caloriesPer100g: 70, proteinPer100g: 3, carbsPer100g: 12, fatPer100g: 1.2, defaultServingG: 300 },
  { name: 'Domates Çorbası', caloriesPer100g: 55, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 1, defaultServingG: 300 },
  { name: 'Yayla Çorbası', caloriesPer100g: 65, proteinPer100g: 4, carbsPer100g: 8, fatPer100g: 2, defaultServingG: 300 },
  { name: 'İşkembe Çorbası', caloriesPer100g: 60, proteinPer100g: 6, carbsPer100g: 3, fatPer100g: 3, defaultServingG: 300 },
  { name: 'Paça Çorbası', caloriesPer100g: 55, proteinPer100g: 7, carbsPer100g: 2, fatPer100g: 2.5, defaultServingG: 300 },
  { name: 'Tavuk Çorbası', caloriesPer100g: 50, proteinPer100g: 5, carbsPer100g: 4, fatPer100g: 1.5, defaultServingG: 300 },
  { name: 'Şehriye Çorbası', caloriesPer100g: 65, proteinPer100g: 3, carbsPer100g: 10, fatPer100g: 1.5, defaultServingG: 300 },

  // Et Yemekleri (Ana Yemekler)
  { name: 'Kuru Fasulye (etli)', caloriesPer100g: 145, proteinPer100g: 8, carbsPer100g: 18, fatPer100g: 4, defaultServingG: 300 },
  { name: 'Kuru Fasulye (zeytinyağlı)', caloriesPer100g: 130, proteinPer100g: 6, carbsPer100g: 18, fatPer100g: 4, defaultServingG: 300 },
  { name: 'Etli Nohut', caloriesPer100g: 155, proteinPer100g: 9, carbsPer100g: 17, fatPer100g: 5, defaultServingG: 300 },
  { name: 'Hünkar Beğendi', caloriesPer100g: 175, proteinPer100g: 10, carbsPer100g: 12, fatPer100g: 10, defaultServingG: 300 },
  { name: 'Kuzu Güveç', caloriesPer100g: 180, proteinPer100g: 14, carbsPer100g: 8, fatPer100g: 10, defaultServingG: 300 },
  { name: 'Kağıt Kebap', caloriesPer100g: 200, proteinPer100g: 16, carbsPer100g: 6, fatPer100g: 13, defaultServingG: 250 },
  { name: 'Tas Kebabı', caloriesPer100g: 165, proteinPer100g: 14, carbsPer100g: 8, fatPer100g: 9, defaultServingG: 300 },
  { name: 'Orman Kebabı', caloriesPer100g: 170, proteinPer100g: 14, carbsPer100g: 9, fatPer100g: 9, defaultServingG: 300 },
  { name: 'Tavuk Sote', caloriesPer100g: 155, proteinPer100g: 18, carbsPer100g: 5, fatPer100g: 7, defaultServingG: 250 },
  { name: 'Tavuk Güveç', caloriesPer100g: 140, proteinPer100g: 16, carbsPer100g: 7, fatPer100g: 5, defaultServingG: 300 },
  { name: 'Hamsi Tava', caloriesPer100g: 210, proteinPer100g: 20, carbsPer100g: 8, fatPer100g: 11, defaultServingG: 150 },
  { name: 'Balık Izgara', caloriesPer100g: 180, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 9, defaultServingG: 200 },

  // Zeytinyağlılar & Sebze Yemekleri
  { name: 'İmam Bayıldı', caloriesPer100g: 110, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 7, defaultServingG: 250 },
  { name: 'Karnıyarık', caloriesPer100g: 145, proteinPer100g: 7, carbsPer100g: 10, fatPer100g: 9, defaultServingG: 300 },
  { name: 'Zeytinyağlı Taze Fasulye', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 5, defaultServingG: 250 },
  { name: 'Zeytinyağlı Pırasa', caloriesPer100g: 95, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 5, defaultServingG: 250 },
  { name: 'Zeytinyağlı Enginar', caloriesPer100g: 80, proteinPer100g: 3, carbsPer100g: 8, fatPer100g: 4, defaultServingG: 200 },
  { name: 'Zeytinyağlı Kereviz', caloriesPer100g: 85, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 4, defaultServingG: 250 },
  { name: 'Musakka', caloriesPer100g: 155, proteinPer100g: 7, carbsPer100g: 9, fatPer100g: 10, defaultServingG: 300 },
  { name: 'Türlü', caloriesPer100g: 100, proteinPer100g: 3, carbsPer100g: 12, fatPer100g: 5, defaultServingG: 300 },
  { name: 'Menemen', caloriesPer100g: 110, proteinPer100g: 6, carbsPer100g: 6, fatPer100g: 7, defaultServingG: 200 },

  // Pilavlar
  { name: 'Pirinç Pilavı (sade)', caloriesPer100g: 165, proteinPer100g: 3, carbsPer100g: 34, fatPer100g: 2.5, defaultServingG: 200 },
  { name: 'Pirinç Pilavı (tereyağlı)', caloriesPer100g: 185, proteinPer100g: 3, carbsPer100g: 34, fatPer100g: 5, defaultServingG: 200 },
  { name: 'Bulgur Pilavı', caloriesPer100g: 150, proteinPer100g: 4, carbsPer100g: 28, fatPer100g: 3, defaultServingG: 200 },
  { name: 'Domatesli Bulgur Pilavı', caloriesPer100g: 145, proteinPer100g: 4, carbsPer100g: 27, fatPer100g: 3, defaultServingG: 200 },
  { name: 'Nohutlu Pilav', caloriesPer100g: 175, proteinPer100g: 5, carbsPer100g: 32, fatPer100g: 3, defaultServingG: 200 },
  { name: 'Şehriyeli Pilav', caloriesPer100g: 170, proteinPer100g: 4, carbsPer100g: 33, fatPer100g: 3, defaultServingG: 200 },

  // Salatalar & Mezeler
  { name: 'Çoban Salatası', caloriesPer100g: 50, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 2.5, defaultServingG: 200 },
  { name: 'Cacık', caloriesPer100g: 65, proteinPer100g: 3, carbsPer100g: 5, fatPer100g: 3.5, defaultServingG: 150 },
  { name: 'Haydari', caloriesPer100g: 110, proteinPer100g: 5, carbsPer100g: 4, fatPer100g: 8, defaultServingG: 100 },
  { name: 'Patlıcan Ezmesi', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 7, fatPer100g: 6, defaultServingG: 100 },
  { name: 'Acuka / Muhammara', caloriesPer100g: 200, proteinPer100g: 5, carbsPer100g: 18, fatPer100g: 12, defaultServingG: 50 },
  { name: 'Humus', caloriesPer100g: 170, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 9, defaultServingG: 100 },
  { name: 'Tarama', caloriesPer100g: 240, proteinPer100g: 5, carbsPer100g: 8, fatPer100g: 21, defaultServingG: 50 },
  { name: 'Zeytinli Meze', caloriesPer100g: 145, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 13, defaultServingG: 50 },
  { name: 'Gavurdağı Salatası', caloriesPer100g: 80, proteinPer100g: 2, carbsPer100g: 7, fatPer100g: 5, defaultServingG: 150 },
  { name: 'Kisir', caloriesPer100g: 130, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 5, defaultServingG: 150 },
  { name: 'Tabbule', caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 16, fatPer100g: 5, defaultServingG: 150 },
  { name: 'Semizotu Salatası', caloriesPer100g: 75, proteinPer100g: 2, carbsPer100g: 5, fatPer100g: 5, defaultServingG: 150 },

  // Kahvaltı
  { name: 'Beyaz Peynir', caloriesPer100g: 265, proteinPer100g: 17, carbsPer100g: 2, fatPer100g: 21, defaultServingG: 60 },
  { name: 'Kaşar Peyniri', caloriesPer100g: 355, proteinPer100g: 26, carbsPer100g: 1, fatPer100g: 28, defaultServingG: 50 },
  { name: 'Tulum Peyniri', caloriesPer100g: 320, proteinPer100g: 22, carbsPer100g: 2, fatPer100g: 25, defaultServingG: 50 },
  { name: 'Sucuk', caloriesPer100g: 450, proteinPer100g: 22, carbsPer100g: 2, fatPer100g: 40, defaultServingG: 50 },
  { name: 'Pastırma', caloriesPer100g: 290, proteinPer100g: 35, carbsPer100g: 2, fatPer100g: 16, defaultServingG: 40 },
  { name: 'Kaymak', caloriesPer100g: 430, proteinPer100g: 3, carbsPer100g: 3, fatPer100g: 45, defaultServingG: 30 },
  { name: 'Bal', caloriesPer100g: 305, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0, defaultServingG: 20 },
  { name: 'Reçel', caloriesPer100g: 250, proteinPer100g: 0.5, carbsPer100g: 65, fatPer100g: 0, defaultServingG: 30 },
  { name: 'Tahin', caloriesPer100g: 595, proteinPer100g: 17, carbsPer100g: 24, fatPer100g: 53, defaultServingG: 30 },
  { name: 'Tahin Pekmez', caloriesPer100g: 380, proteinPer100g: 7, carbsPer100g: 50, fatPer100g: 18, defaultServingG: 50 },
  { name: 'Pekmez', caloriesPer100g: 290, proteinPer100g: 2, carbsPer100g: 73, fatPer100g: 0.1, defaultServingG: 30 },
  { name: 'Zeytin (siyah)', caloriesPer100g: 115, proteinPer100g: 0.8, carbsPer100g: 6, fatPer100g: 10, defaultServingG: 30 },
  { name: 'Zeytin (yeşil)', caloriesPer100g: 145, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 14, defaultServingG: 30 },
  { name: 'Çay (şekersiz)', caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0.2, fatPer100g: 0, defaultServingG: 200 },
  { name: 'Türk Kahvesi (şekersiz)', caloriesPer100g: 5, proteinPer100g: 0.3, carbsPer100g: 0.5, fatPer100g: 0, defaultServingG: 60 },
  { name: 'Türk Kahvesi (şekerli)', caloriesPer100g: 30, proteinPer100g: 0.2, carbsPer100g: 7, fatPer100g: 0, defaultServingG: 60 },
  { name: 'Ekmek (beyaz)', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 51, fatPer100g: 3, defaultServingG: 50 },
  { name: 'Ekmek (tam buğday)', caloriesPer100g: 250, proteinPer100g: 10, carbsPer100g: 44, fatPer100g: 3.5, defaultServingG: 50 },
  { name: 'Pide Ekmeği', caloriesPer100g: 270, proteinPer100g: 9, carbsPer100g: 53, fatPer100g: 2.5, defaultServingG: 80 },

  // Tatlılar
  { name: 'Baklava', caloriesPer100g: 430, proteinPer100g: 6, carbsPer100g: 52, fatPer100g: 22, defaultServingG: 80 },
  { name: 'Kadayıf', caloriesPer100g: 380, proteinPer100g: 6, carbsPer100g: 55, fatPer100g: 16, defaultServingG: 100 },
  { name: 'Künefe', caloriesPer100g: 360, proteinPer100g: 9, carbsPer100g: 42, fatPer100g: 18, defaultServingG: 150 },
  { name: 'Şekerpare', caloriesPer100g: 390, proteinPer100g: 5, carbsPer100g: 55, fatPer100g: 17, defaultServingG: 60 },
  { name: 'Revani', caloriesPer100g: 345, proteinPer100g: 5, carbsPer100g: 58, fatPer100g: 11, defaultServingG: 100 },
  { name: 'Lokma', caloriesPer100g: 330, proteinPer100g: 4, carbsPer100g: 52, fatPer100g: 12, defaultServingG: 100 },
  { name: 'Sütlaç', caloriesPer100g: 135, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 3.5, defaultServingG: 200 },
  { name: 'Kazandibi', caloriesPer100g: 155, proteinPer100g: 4, carbsPer100g: 25, fatPer100g: 4, defaultServingG: 200 },
  { name: 'Muhallebi', caloriesPer100g: 120, proteinPer100g: 3, carbsPer100g: 21, fatPer100g: 3, defaultServingG: 200 },
  { name: 'Aşure', caloriesPer100g: 145, proteinPer100g: 4, carbsPer100g: 28, fatPer100g: 2.5, defaultServingG: 200 },
  { name: 'Helva (tahin)', caloriesPer100g: 510, proteinPer100g: 12, carbsPer100g: 55, fatPer100g: 29, defaultServingG: 50 },
  { name: 'İrmik Helvası', caloriesPer100g: 350, proteinPer100g: 5, carbsPer100g: 50, fatPer100g: 14, defaultServingG: 100 },
  { name: 'Lokum', caloriesPer100g: 320, proteinPer100g: 0.5, carbsPer100g: 79, fatPer100g: 0.5, defaultServingG: 30 },
  { name: 'Dondurma', caloriesPer100g: 215, proteinPer100g: 4, carbsPer100g: 30, fatPer100g: 9, defaultServingG: 100 },

  // İçecekler
  { name: 'Ayran', caloriesPer100g: 45, proteinPer100g: 3, carbsPer100g: 4, fatPer100g: 1.5, defaultServingG: 300 },
  { name: 'Şalgam Suyu', caloriesPer100g: 20, proteinPer100g: 0.5, carbsPer100g: 4, fatPer100g: 0, defaultServingG: 300 },
  { name: 'Şerbet', caloriesPer100g: 55, proteinPer100g: 0, carbsPer100g: 14, fatPer100g: 0, defaultServingG: 200 },
  { name: 'Boza', caloriesPer100g: 80, proteinPer100g: 1, carbsPer100g: 19, fatPer100g: 0.2, defaultServingG: 200 },
  { name: 'Sahlep', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 18, fatPer100g: 1.5, defaultServingG: 200 },

  // Fastfood / Sokak Yemekleri
  { name: 'Döner Dürüm', caloriesPer100g: 235, proteinPer100g: 14, carbsPer100g: 22, fatPer100g: 10, defaultServingG: 250 },
  { name: 'Tantuni', caloriesPer100g: 200, proteinPer100g: 15, carbsPer100g: 18, fatPer100g: 7, defaultServingG: 200 },
  { name: 'Kumpir', caloriesPer100g: 185, proteinPer100g: 5, carbsPer100g: 28, fatPer100g: 6.5, defaultServingG: 400 },
  { name: 'Balık Ekmek', caloriesPer100g: 195, proteinPer100g: 14, carbsPer100g: 22, fatPer100g: 6, defaultServingG: 250 },
  { name: 'Midye Dolma', caloriesPer100g: 130, proteinPer100g: 7, carbsPer100g: 16, fatPer100g: 4, defaultServingG: 200 },
  { name: 'Kokoreç', caloriesPer100g: 285, proteinPer100g: 18, carbsPer100g: 15, fatPer100g: 17, defaultServingG: 200 },
  { name: 'Islak Hamburger', caloriesPer100g: 255, proteinPer100g: 12, carbsPer100g: 28, fatPer100g: 11, defaultServingG: 180 },
];

async function main() {
  console.log('Adding Turkish foods to database...');

  let added = 0;
  let skipped = 0;

  for (const food of turkishFoods) {
    const existing = await prisma.foodItem.findFirst({
      where: { name: food.name }
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.foodItem.create({ data: food });
    added++;
    console.log(`  + ${food.name}`);
  }

  console.log(`\nDone! Added: ${added}, Skipped (already exists): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
