import React, {useEffect, useState} from 'react';
import ForgeReconciler, {Heading, Text, Stack, Lozenge, Spinner, Button, SectionMessage} from '@forge/react';
import {view, invoke} from '@forge/bridge';

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true); setError('');
    try {
      const context = await view.getContext();
      const key = context?.extension?.issue?.key;
      if (!key) throw new Error('Open SpecGuard on a Jira issue.');
      setResult(await invoke('analyzeIssue', {issueKey: key}));
    } catch (e) { setError(String(e?.message || e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  if (loading) return <Spinner />;
  if (error) return <SectionMessage appearance="error"><Text>{error}</Text><Button onClick={refresh}>Retry</Button></SectionMessage>;
  return <Stack space="space.200">
    <Heading size="medium">Specification evidence map: {result.key}</Heading>
    <Text>{result.summary}</Text>
    <Text>Specification completeness: {result.completeness.present}/{result.completeness.total} (presence checks, not quality scoring)</Text>
    {result.completeness.missing.map((gap,i) => <Text key={i}>Gap: {gap}</Text>)}
    <Heading size="small">Acceptance criteria ({result.criteria.length})</Heading>
    {result.criteria.length === 0 && <Text>No explicit acceptance criteria extracted.</Text>}
    {result.criteria.map(c => <Stack key={c.id} space="space.050"><Text>{c.id}: {c.text}</Text><Lozenge appearance="warning">NOT VERIFIED</Lozenge></Stack>)}
    <Heading size="small">Linked test / review evidence ({result.evidenceReferences.length})</Heading>
    {result.evidenceReferences.map((link,i) => <Text key={i}>{link}</Text>)}
    <SectionMessage appearance="information"><Text>{result.disclaimer}</Text></SectionMessage>
    <Button onClick={refresh}>Refresh analysis</Button>
  </Stack>;
}
ForgeReconciler.render(<App />);
