import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dbService, SEED_USERS } from '../src/lib/db';
import { markdownToHtml, calculateTextStats } from '../src/lib/markdown-parser';

describe('Ajaia Docs Persistence & Access Control Test Suite', () => {
  it('should initialize and load seed users', () => {
    const users = dbService.getUsers();
    assert.strictEqual(users.length, 3);
    assert.ok(users.some((u) => u.email === 'alice@ajaia.io'));
    assert.ok(users.some((u) => u.email === 'bob@ajaia.io'));
    assert.ok(users.some((u) => u.email === 'charlie@ajaia.io'));
  });

  it('should retrieve documents for active user with correct role annotations', () => {
    const aliceDocs = dbService.getDocuments('user_alice');
    assert.ok(aliceDocs.length >= 1);

    // Alice should own doc_1
    const doc1 = aliceDocs.find((d) => d.id === 'doc_1');
    assert.ok(doc1);
    assert.strictEqual(doc1.currentUserRole, 'owner');

    // Bob should see doc_1 as editor
    const bobDocs = dbService.getDocuments('user_bob');
    const bobDoc1 = bobDocs.find((d) => d.id === 'doc_1');
    assert.ok(bobDoc1);
    assert.strictEqual(bobDoc1.currentUserRole, 'editor');

    // Charlie should see doc_1 as viewer
    const charlieDocs = dbService.getDocuments('user_charlie');
    const charlieDoc1 = charlieDocs.find((d) => d.id === 'doc_1');
    assert.ok(charlieDoc1);
    assert.strictEqual(charlieDoc1.currentUserRole, 'viewer');
  });

  it('should create a new document, update word count, and retrieve it', () => {
    const newDoc = dbService.createDocument({
      title: 'Automated Test Document',
      content: '<h1>Testing Antigravity</h1><p>This is a paragraph with several words.</p>',
      ownerId: 'user_alice',
    });

    assert.ok(newDoc.id);
    assert.strictEqual(newDoc.title, 'Automated Test Document');
    assert.strictEqual(newDoc.ownerId, 'user_alice');
    assert.ok(newDoc.wordCount > 0);

    // Should fetch by ID
    const fetched = dbService.getDocumentById(newDoc.id, 'user_alice');
    assert.ok(fetched);
    assert.strictEqual(fetched.title, 'Automated Test Document');
  });

  it('should enforce editing permissions: Editor can edit, Viewer is blocked', () => {
    // Create doc owned by Alice
    const doc = dbService.createDocument({
      title: 'Permission Test Doc',
      content: '<p>Initial content</p>',
      ownerId: 'user_alice',
    });

    // Share with Bob as Editor
    const shareBob = dbService.shareDocument(doc.id, 'bob@ajaia.io', 'editor', 'user_alice');
    assert.strictEqual(shareBob.success, true);

    // Share with Charlie as Viewer
    const shareCharlie = dbService.shareDocument(doc.id, 'charlie@ajaia.io', 'viewer', 'user_alice');
    assert.strictEqual(shareCharlie.success, true);

    // Bob (Editor) edits doc -> should succeed
    const bobEdit = dbService.updateDocument(
      doc.id,
      { content: '<p>Updated by Bob the Editor</p>' },
      'user_bob'
    );
    assert.strictEqual(bobEdit.success, true);

    // Charlie (Viewer) tries to edit doc -> must fail with 403 unauthorized
    const charlieEdit = dbService.updateDocument(
      doc.id,
      { content: '<p>Malicious viewer edit attempt</p>' },
      'user_charlie'
    );
    assert.strictEqual(charlieEdit.success, false);
    assert.ok(charlieEdit.error?.includes('Unauthorized'));
  });

  it('should allow owner to revoke sharing access', () => {
    const doc = dbService.createDocument({
      title: 'Revocation Test Doc',
      content: '<p>Secret</p>',
      ownerId: 'user_alice',
    });

    dbService.shareDocument(doc.id, 'bob@ajaia.io', 'editor', 'user_alice');
    let bobAccess = dbService.getDocumentById(doc.id, 'user_bob');
    assert.ok(bobAccess !== null);

    // Alice revokes Bob's access
    const revoke = dbService.removeShare(doc.id, 'user_bob', 'user_alice');
    assert.strictEqual(revoke.success, true);

    // Bob can no longer access doc
    bobAccess = dbService.getDocumentById(doc.id, 'user_bob');
    assert.strictEqual(bobAccess, null);
  });

  it('should convert markdown and plaintext into rich HTML', () => {
    const markdown = `# Main Title
## Section 1
Here is **bold** text and *italic* text.

- First item
- Second item

> Important quote

\`\`\`
const x = 42;
\`\`\`
`;
    const html = markdownToHtml(markdown);
    assert.ok(html.includes('<h1>Main Title</h1>'));
    assert.ok(html.includes('<h2>Section 1</h2>'));
    assert.ok(html.includes('<strong>bold</strong>'));
    assert.ok(html.includes('<em>italic</em>'));
    assert.ok(html.includes('<ul><li>First item</li>'));
    assert.ok(html.includes('<blockquote>'));
    assert.ok(html.includes('<pre><code>const x = 42;</code></pre>'));

    const stats = calculateTextStats(html);
    assert.ok(stats.wordCount > 5);
  });

  it('should handle document attachments lifecycle', () => {
    const doc = dbService.createDocument({
      title: 'Attachment Test Doc',
      content: '<p>Document with attachments</p>',
      ownerId: 'user_alice',
    });

    const addRes = dbService.addAttachment(doc.id, {
      originalName: 'system_design.pdf',
      filename: 'system_design_123.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 10240,
      uploadedBy: 'user_alice',
    });

    assert.strictEqual(addRes.success, true);
    assert.ok(addRes.attachment?.id);

    // Fetch document and verify attachment
    const fetched = dbService.getDocumentById(doc.id, 'user_alice');
    assert.strictEqual(fetched?.attachments.length, 1);
    assert.strictEqual(fetched?.attachments[0].originalName, 'system_design.pdf');

    // Delete attachment
    const delRes = dbService.deleteAttachment(doc.id, addRes.attachment!.id, 'user_alice');
    assert.strictEqual(delRes.success, true);

    const refetched = dbService.getDocumentById(doc.id, 'user_alice');
    assert.strictEqual(refetched?.attachments.length, 0);
  });
});
