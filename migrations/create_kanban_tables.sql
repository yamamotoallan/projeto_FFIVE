-- Create kanban_stages table
CREATE TABLE IF NOT EXISTS kanban_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_position INTEGER NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create kanban_checklist_templates table
CREATE TABLE IF NOT EXISTS kanban_checklist_templates (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER REFERENCES kanban_stages(id) ON DELETE CASCADE,
    item_label VARCHAR(255) NOT NULL,
    order_position INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial stages (only if empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM kanban_stages) THEN
        INSERT INTO kanban_stages (name, order_position, color, icon) VALUES
        ('Refinamento Projetista', 1, 'blue', 'design_services'),
        ('Recorte', 2, 'purple', 'content_cut'),
        ('Montagem Fábrica', 3, 'orange', 'handyman'),
        ('Logística', 4, 'green', 'local_shipping');
    END IF;
END $$;

-- Seed initial checklist templates (Example logic - adapting from what might be standard)
DO $$
DECLARE
    refinamento_id INTEGER;
    recorte_id INTEGER;
    montagem_id INTEGER;
BEGIN
    SELECT id INTO refinamento_id FROM kanban_stages WHERE name = 'Refinamento Projetista';
    SELECT id INTO recorte_id FROM kanban_stages WHERE name = 'Recorte';
    SELECT id INTO montagem_id FROM kanban_stages WHERE name = 'Montagem Fábrica';

    IF refinamento_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kanban_checklist_templates WHERE stage_id = refinamento_id) THEN
        INSERT INTO kanban_checklist_templates (stage_id, item_label, order_position) VALUES
        (refinamento_id, 'Conferir medidas finais', 1),
        (refinamento_id, 'Validar plano de corte', 2),
        (refinamento_id, 'Gerar lista de materiais', 3);
    END IF;

    IF recorte_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kanban_checklist_templates WHERE stage_id = recorte_id) THEN
        INSERT INTO kanban_checklist_templates (stage_id, item_label, order_position) VALUES
        (recorte_id, 'Verificar espessuras', 1),
        (recorte_id, 'Etiquetar peças', 2);
    END IF;
    
    IF montagem_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kanban_checklist_templates WHERE stage_id = montagem_id) THEN
        INSERT INTO kanban_checklist_templates (stage_id, item_label, order_position) VALUES
        (montagem_id, 'Pré-montagem estrutural', 1),
        (montagem_id, 'Acabamento de bordas', 2),
        (montagem_id, 'Limpeza final', 3);
    END IF;
END $$;
