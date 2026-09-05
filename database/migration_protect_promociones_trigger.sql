-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM — TRIGGER DE PROTECCIÓN PERMANENTE EN BASE DE DATOS
-- Evita que cualquier sincronizador antiguo guarde porcentajes como importes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trg_protect_promocion_porcentual()
RETURNS TRIGGER AS $$
BEGIN
  -- Si costo_promocion fue enviado como porcentaje de descuento (ej. 5, 7, 10, 20, 50)
  -- en vez del costo con descuento aplicado:
  IF NEW.costo_promocion IS NOT NULL 
     AND NEW.costo_ct IS NOT NULL 
     AND NEW.costo_ct > 50 
     AND NEW.costo_promocion > 0 
     AND NEW.costo_promocion <= 90 
     AND (NEW.costo_promocion / NEW.costo_ct) < 0.40 THEN
    -- Convertir automáticamente el porcentaje al costo neto con descuento
    NEW.costo_promocion := ROUND(NEW.costo_ct * (1.0 - (NEW.costo_promocion / 100.0)), 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_products_protect_promo ON products;

CREATE TRIGGER trg_before_products_protect_promo
BEFORE INSERT OR UPDATE OF costo_promocion, costo_ct ON products
FOR EACH ROW
EXECUTE FUNCTION trg_protect_promocion_porcentual();
