import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractCompletionText } from '../src/services/ai/extractCompletionText.ts';

describe('extractCompletionText', () => {
  it('reads a normal chat-completion content string', () => {
    const text = extractCompletionText({
      choices: [{ message: { content: 'I am excited to join Auroscale.' } }],
    });
    assert.equal(text, 'I am excited to join Auroscale.');
  });

  it('joins array content parts used by newer OpenAI-style APIs', () => {
    const text = extractCompletionText({
      choices: [{
        message: {
          content: [
            { type: 'text', text: 'First. ' },
            { type: 'text', text: 'Second.' },
          ],
        },
      }],
    });
    assert.equal(text, 'First. Second.');
  });

  it('falls back to reasoning_content when content is empty (reasoning models)', () => {
    const text = extractCompletionText({
      choices: [{
        message: {
          content: '',
          reasoning_content: 'The intern role matches my full-stack experience.',
        },
        finish_reason: 'length',
      }],
    });
    assert.equal(text, 'The intern role matches my full-stack experience.');
  });

  it('strips <think> wrappers so only the final answer remains', () => {
    const text = extractCompletionText({
      choices: [{
        message: {
          content: '<think>planning the tone</think>\nI want to learn from this team.',
        },
      }],
    });
    assert.equal(text, 'I want to learn from this team.');
  });

  it('falls back to reasoning when content is only a closed think block', () => {
    const text = extractCompletionText({
      choices: [{
        message: {
          content: '<think>\nplanning the answer in detail\n</think>\n',
          reasoning_content: 'I am excited about the intern role because of the product.',
        },
      }],
    });
    assert.equal(text, 'I am excited about the intern role because of the product.');
  });

  it('reads Ollama native { message.content } payloads', () => {
    const text = extractCompletionText({
      message: { content: 'I am excited about the intern role.' },
    });
    assert.equal(text, 'I am excited about the intern role.');
  });

  it('returns empty string when the model produced nothing usable', () => {
    const text = extractCompletionText({
      choices: [{ message: { content: '', reasoning_content: '' } }],
    });
    assert.equal(text, '');
  });
});
