/**
 * Teste de configuração dos agentes após remoção do Replit
 * Verifica se os agentes estão usando apenas GEMINI_API_KEY
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

describe('Configuração dos Agentes - Remoção do Replit', () => {
  describe('server/agents/base-agent.ts', () => {
    it('deve usar apenas GEMINI_API_KEY', () => {
      const content = readFileSync(
        join(projectRoot, 'server/agents/base-agent.ts'),
        'utf-8'
      );
      
      // Deve conter GEMINI_API_KEY
      expect(content).toContain('GEMINI_API_KEY');
      
      // NÃO deve conter referências ao Replit AI Integrations (variáveis)
      expect(content).not.toContain('AI_INTEGRATIONS_GEMINI_API_KEY');
      expect(content).not.toContain('AI_INTEGRATIONS_GEMINI_BASE_URL');
      
      // NÃO deve usar httpOptions.baseUrl
      expect(content).not.toMatch(/httpOptions.*baseUrl/);
      
      // Remove comentários e verifica código (não comentários)
      const codeWithoutComments = content
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('//') && 
                 !trimmed.startsWith('*') && 
                 !trimmed.startsWith('/*') &&
                 !trimmed.match(/^\s*\/\*/);
        })
        .join('\n');
      
      // Código não deve conter "replit" (apenas comentários podem mencionar)
      expect(codeWithoutComments.toLowerCase()).not.toContain('replit');
      expect(codeWithoutComments).not.toContain('AI_INTEGRATIONS');
    });
    
    it('deve inicializar GoogleGenAI corretamente', () => {
      const content = readFileSync(
        join(projectRoot, 'server/agents/base-agent.ts'),
        'utf-8'
      );
      
      // Deve ter a inicialização correta
      expect(content).toMatch(/new GoogleGenAI\(\s*\{[^}]*apiKey:\s*process\.env\.GEMINI_API_KEY/);
      
      // Deve validar GEMINI_API_KEY antes de inicializar
      expect(content).toMatch(/if\s*\(!process\.env\.GEMINI_API_KEY\)/);
      expect(content).toContain('aistudio.google.com');
    });
  });
  
  describe('server/gemini.ts', () => {
    it('deve usar apenas GEMINI_API_KEY', () => {
      const content = readFileSync(
        join(projectRoot, 'server/gemini.ts'),
        'utf-8'
      );
      
      // Deve conter GEMINI_API_KEY
      expect(content).toContain('GEMINI_API_KEY');
      
      // NÃO deve conter referências ao Replit AI Integrations (variáveis)
      expect(content).not.toContain('AI_INTEGRATIONS_GEMINI_API_KEY');
      expect(content).not.toContain('AI_INTEGRATIONS_GEMINI_BASE_URL');
      
      // NÃO deve usar httpOptions.baseUrl
      expect(content).not.toMatch(/httpOptions.*baseUrl/);
      
      // Remove comentários e verifica código (não comentários)
      const codeWithoutComments = content
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('//') && 
                 !trimmed.startsWith('*') && 
                 !trimmed.startsWith('/*') &&
                 !trimmed.match(/^\s*\/\*/);
        })
        .join('\n');
      
      // Código não deve conter "replit" (apenas comentários podem mencionar)
      expect(codeWithoutComments.toLowerCase()).not.toContain('replit');
      expect(codeWithoutComments).not.toContain('AI_INTEGRATIONS');
    });
    
    it('deve inicializar GoogleGenAI corretamente', () => {
      const content = readFileSync(
        join(projectRoot, 'server/gemini.ts'),
        'utf-8'
      );
      
      // Deve ter a inicialização correta
      expect(content).toMatch(/new GoogleGenAI\(\s*\{[^}]*apiKey:\s*process\.env\.GEMINI_API_KEY/);
      
      // Deve validar GEMINI_API_KEY antes de inicializar
      expect(content).toMatch(/if\s*\(!process\.env\.GEMINI_API_KEY\)/);
      expect(content).toContain('aistudio.google.com');
    });
  });
  
  describe('server/index.ts', () => {
    it('deve validar GEMINI_API_KEY', () => {
      const content = readFileSync(
        join(projectRoot, 'server/index.ts'),
        'utf-8'
      );
      
      // Deve validar GEMINI_API_KEY
      expect(content).toContain('GEMINI_API_KEY');
      expect(content).toMatch(/if\s*\(!process\.env\.GEMINI_API_KEY\)/);
      expect(content).toContain('obrigatório');
      
      // Deve ter mensagem de erro clara com link para obter API key
      expect(content).toContain('aistudio.google.com');
    });
    
    it('deve logar quando GEMINI_API_KEY está configurada', () => {
      const content = readFileSync(
        join(projectRoot, 'server/index.ts'),
        'utf-8'
      );
      
      // Deve logar informações sobre a API
      expect(content).toContain('Google Gemini API configurada');
      expect(content).toContain('Usando API direta do Google Gemini');
      expect(content).toContain('não Replit');
    });
  });
  
  describe('Verificação geral', () => {
    it('não deve haver uso do Replit AI Integrations no código (apenas comentários são permitidos)', () => {
      const files = [
        'server/agents/base-agent.ts',
        'server/gemini.ts',
        'server/index.ts',
      ];
      
      files.forEach(file => {
        const content = readFileSync(join(projectRoot, file), 'utf-8');
        
        // Remove comentários para verificar apenas código
        const codeWithoutComments = content
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('//') && 
                   !trimmed.startsWith('*') && 
                   !trimmed.startsWith('/*') &&
                   !trimmed.endsWith('*/');
          })
          .join('\n');
        
        // Não deve conter AI_INTEGRATIONS no código (apenas em comentários)
        expect(codeWithoutComments).not.toContain('AI_INTEGRATIONS');
        expect(codeWithoutComments.toLowerCase()).not.toMatch(/ai_integrations/);
        
        // Deve usar apenas GEMINI_API_KEY no código
        expect(codeWithoutComments).toContain('GEMINI_API_KEY');
      });
    });
  });
});

