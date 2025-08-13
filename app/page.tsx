"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";

// ---------- Types ----------
type MiniFigures = { count?: number; roles?: string[]; action?: string };
type Composition = {
  framing?: string;
  scale_hint?: string;
  background?: string;
};
type Lighting = { type?: string; mood?: string; shadows?: string };
type StyleBlock = {
  keywords?: string[];
  color_palette?: string;
  finish?: string;
};
type Camera = { lens?: string; depth?: string; focus?: string };
type MjParams = { ar?: string };

export type MiniCalendarSchema = {
  title?: string;
  concept?: string;
  transformation?: string;
  mini_figures?: MiniFigures;
  composition?: Composition;
  lighting?: Lighting;
  style?: StyleBlock;
  camera?: Camera;
  negatives?: string[];
  quality_note?: string;
  mj_params?: MjParams;
};

// ---------- Styled Components ----------
const PageContainer = styled.main`
  min-height: 100dvh;
  padding: 24px;
`;
const Container = styled.section`
  max-width: 1180px;
  margin: 0 auto;
`;
const Header = styled.header`
  margin-bottom: 18px;
  h1 {
    font-size: 28px;
    margin: 0 0 6px;
    letter-spacing: 0.2px;
  }
  p {
    margin: 0;
    color: var(--muted);
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
`;
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`;
const Mono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: var(--muted);
  border: 1px dashed var(--border);
  padding: 2px 8px;
  border-radius: 999px;
`;
const Textarea = styled.textarea`
  width: 100%;
  min-height: 320px;
  background: #0c0f16;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  resize: vertical;
  line-height: 1.55;
  font-size: 13.5px;
  &::placeholder {
    color: #687083;
  }
`;
const OutputArea = styled(Textarea)`
  min-height: 200px;
  background: #0a0d13;
`;
const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const Small = styled.p`
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 12.5px;
`;
const List = styled.div`
  display: grid;
  gap: 10px;
`;
const Item = styled.div`
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  background: #0a0d13;
`;
const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;
const Index = styled.span`
  font-size: 12px;
  color: var(--muted);
`;
const Warn = styled.div`
  margin-top: 10px;
  color: #ffcc66;
  font-size: 13px;
`;
const Button = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--accent);
  border: 1px solid var(--accent-2);
  color: #fff;
  cursor: pointer;
`;
const Ghost = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  border: 1px dashed var(--border);
  cursor: pointer;
`;
const Footer = styled.footer`
  margin-top: 14px;
  color: var(--muted);
  font-size: 13px;
  code {
    color: var(--accent-2);
  }
`;

// ---------- Utils: Strip JSON Comments ----------
function stripJsonComments(input: string): string {
  let out = input.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/(^|[^:])\/\/.*$/gm, (_, p1) => p1);
  return out;
}

// ---------- Utils: Build Single Prompt ----------
function buildPromptText(data: MiniCalendarSchema): {
  text: string;
  warnings: string[];
} {
  const segs: string[] = [];
  const warn: string[] = [];

  const concept = data.concept?.trim();
  if (concept) segs.push(concept);

  const transf = data.transformation?.trim();
  if (transf) segs.push(transf);

  const mf = data.mini_figures;
  if (mf) {
    const count = mf.count ? `${mf.count} tiny figures` : "";
    const roles = mf.roles?.length ? `(${mf.roles.join(", ")})` : "";
    const action = mf.action ? ` ${mf.action}` : "";
    const block = [count, roles].filter(Boolean).join(" ");
    if (block || action) segs.push([block, action].join(""));
  }

  const comp = data.composition;
  if (comp) {
    const framing = comp.framing ? `${comp.framing}` : "";
    const scale = comp.scale_hint ? `${comp.scale_hint}` : "";
    const bg = comp.background ? `${comp.background}` : "";
    const joined = [framing, scale, bg].filter(Boolean).join(", ");
    if (joined) segs.push(joined);
  }

  const light = data.lighting;
  if (light) {
    const t = light.type ? `${light.type}` : "";
    const m = light.mood ? `${light.mood}` : "";
    const s = light.shadows ? `${light.shadows}` : "";
    const joined = [t, m, s].filter(Boolean).join(", ");
    if (joined) segs.push(joined);
  }

  const style = data.style;
  if (style) {
    const kw = style.keywords?.length ? style.keywords.join(", ") : "";
    const pal = style.color_palette ? style.color_palette : "";
    const fin = style.finish ? style.finish : "";
    const joined = [kw, pal, fin].filter(Boolean).join(" | ");
    if (joined) segs.push(joined);
  }

  const cam = data.camera;
  if (cam) {
    const lens = cam.lens ? cam.lens : "";
    const depth = cam.depth ? cam.depth : "";
    const focus = cam.focus ? cam.focus : "";
    const joined = [lens, depth, focus].filter(Boolean).join(", ");
    if (joined) segs.push(joined);
  }

  if (data.negatives?.length) segs.push(`--no ${data.negatives.join(", ")}`);
  if (data.quality_note) segs.push(data.quality_note);
  if (data.mj_params?.ar) segs.push(`--ar ${data.mj_params.ar}`);

  const text = segs.filter(Boolean).join(" \n- ");
  if (!text) warn.push("ไม่มีข้อมูลเพียงพอในการสร้าง prompt");

  return { text, warnings: warn };
}

export default function Page() {
  const [input, setInput] = useState<string>(
    `// วาง JSON หรือ JSONC ของคุณไว้ที่นี่\n{\n  \"concept\": \"sunlit diorama of a small town\",\n  \"transformation\": \"in mid-century modern style\",\n  \"mini_figures\": { \"count\": 3, \"roles\": [\"baker\", \"child\"], \"action\": \"walking across the plaza\" },\n  \"composition\": { \"framing\": \"isometric\", \"scale_hint\": \"1:87\", \"background\": \"matte board\" },\n  \"lighting\": { \"type\": \"soft daylight\", \"mood\": \"warm\", \"shadows\": \"long soft shadows\" },\n  \"style\": { \"keywords\": [\"pastel\", \"flat\"], \"color_palette\": \"dusty pink & teal\", \"finish\": \"grainy\" },\n  \"camera\": { \"lens\": \"50mm\", \"depth\": \"shallow\", \"focus\": \"foreground sharp\" },\n  \"negatives\": [\"blur\", \"noise\"],\n  \"mj_params\": { \"ar\": \"16:9\" }\n}`
  );
  const [prompts, setPrompts] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const [userKey, setUserKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  function extractResponseText(obj: any): string {
    if (obj?.output_text) return obj.output_text as string;
    const content = obj?.output?.[0]?.content?.[0];
    if (content?.type === "output_text" && content?.text)
      return content.text as string;
    const t = obj?.choices?.[0]?.message?.content;
    if (typeof t === "string") return t;
    if (Array.isArray(t)) {
      const firstText = t.find((c: any) => c.type === "text")?.text;
      if (firstText) return firstText;
    }
    return JSON.stringify(obj, null, 2);
  }

  async function handleAiGenerate() {
    if (!userKey.trim() || !keyword.trim()) return;
    setAiLoading(true);
    setAiResult("");

    try {
      const prompt = `จากคีย์เวิร์ด \"${keyword}\" สรุปเป็นหัวข้อย่อย 3-5 ข้อ กระชับ เข้าใจง่าย ภาษาไทย พร้อมคำอธิบายสั้น ๆ`;
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiResult(data?.error?.message ?? "เรียก API ไม่สำเร็จ");
      } else {
        setAiResult(extractResponseText(data));
      }
    } catch (e: any) {
      setAiResult(e?.message ?? "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setAiLoading(false);
    }
  }

  const inputLines = useMemo(() => input.split("\n").length, [input]);

  const handleConvert = () => {
    setError(null);
    setWarnings([]);
    setPrompts([]);
    setCopiedIndex(null);
    setCopiedAll(false);

    try {
      const clean = stripJsonComments(input);
      const parsed = JSON.parse(clean);

      const items: MiniCalendarSchema[] = Array.isArray(parsed)
        ? parsed
        : [parsed];
      const out: string[] = [];
      const warnAll: string[] = [];

      items.forEach((item, idx) => {
        const { text, warnings } = buildPromptText(item);
        out.push(text);
        if (warnings.length)
          warnAll.push(`Item #${idx + 1}: ${warnings.join(" | ")}`);
      });

      setPrompts(out);
      setWarnings(warnAll);
    } catch (e: any) {
      setError(`แปลง JSON ไม่สำเร็จ: ${e?.message ?? "unknown error"}`);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(prompts.join("\n\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1200);
    } catch {}
  };

  const handleCopyOne = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {}
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <h1>Prompt Builder</h1>
          <p>
            วาง JSON/JSONC เพื่อสร้าง prompt
          </p>
        </Header>

        <Grid>
          <Card>
            <CardHeader>
              <h2>Input JSON / JSONC</h2>
              <Mono>lines: {inputLines}</Mono>
            </CardHeader>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Actions>
              <Button onClick={handleConvert}>Convert</Button>
              <Ghost onClick={() => setInput("")}>Clear</Ghost>
            </Actions>
            {error && <Warn>{error}</Warn>}
          </Card>

          <Card>
            <CardHeader>
              <h2>ผลลัพธ์ Prompt</h2>
              <Mono>{prompts.length} items</Mono>
            </CardHeader>

            {!prompts.length && (
              <Warn>ยังไม่มีผลลัพธ์ กรุณากด Convert ก่อน</Warn>
            )}

            {!!prompts.length && (
              <List>
                {prompts.map((p, i) => (
                  <Item key={i}>
                    <ItemHeader>
                      <div>
                        <Index>#{i + 1}</Index>
                      </div>
                      <Ghost onClick={() => handleCopyOne(p, i)}>
                        {copiedIndex === i ? "Copied!" : "Copy"}
                      </Ghost>
                    </ItemHeader>
                    <OutputArea value={p} readOnly />
                  </Item>
                ))}
              </List>
            )}

            {!!prompts.length && (
              <Actions>
                <Button onClick={handleCopyAll}>
                  {copiedAll ? "Copied!" : "Copy All"}
                </Button>
              </Actions>
            )}

            {!!warnings.length && (
              <Warn>
                {warnings.map((w, idx) => (
                  <div key={idx}>• {w}</div>
                ))}
              </Warn>
            )}
          </Card>
        </Grid>
        {/* <div>
          <Card>
            <CardHeader>
              <h2>Generate จากคีย์เวิร์ด (ผู้ใช้ใส่คีย์เอง)</h2>
              <Mono>REST /v1/responses</Mono>
            </CardHeader>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                type="password"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                placeholder="ใส่ OpenAI API Key ของคุณ (จะถูกใช้จากเบราว์เซอร์ของคุณเอง)"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#0c0f16",
                  color: "var(--text)",
                }}
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ใส่ keyword เช่น carbon credit"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#0c0f16",
                  color: "var(--text)",
                }}
              />

              <Actions>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !userKey.trim() || !keyword.trim()}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "var(--accent)",
                    border: "1px solid var(--accent-2)",
                    color: "#fff",
                    cursor: "pointer",
                    opacity:
                      aiLoading || !userKey.trim() || !keyword.trim() ? 0.6 : 1,
                  }}
                >
                  {aiLoading ? "กำลังสร้าง..." : "Generate"}
                </button>
                <Ghost
                  onClick={() => {
                    setAiResult("");
                    setKeyword("");
                  }}
                >
                  Clear
                </Ghost>
              </Actions>

              <OutputArea
                readOnly
                value={aiResult}
                placeholder="ผลลัพธ์จากโมเดลจะแสดงที่นี่"
              />
              <Warn>
                หมายเหตุ: คีย์ของคุณจะถูกส่งตรงไปยัง api.openai.com
                จากเบราว์เซอร์ของคุณเอง (เหมาะกับการใช้งานส่วนตัว/ทดลอง)
              </Warn>
            </div>
          </Card>
        </div> */}
        <Footer>
          <p>
            หมายเหตุ: ตัวถอดคอมเมนต์ JSONC นี้เป็นแบบง่าย ๆ
            หากมีสตริงที่มีเครื่องหมายคอมเมนต์ด้านใน อาจลบผิดจุดได้
          </p>
        </Footer>
      </Container>
    </PageContainer>
  );
}
