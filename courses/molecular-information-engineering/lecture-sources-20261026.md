# 분자정보공학 9 10 11주차 강의

9주차와 10주차 논문 중심 개편 2026-10-27. 이전 버전은 archive/20261026-v1/에 보관.

|강의|주제|장표|시간|
|---|---|---:|---:|
|9-1|[DNA 장기 보존의 재료와 실험 평가](week09/lecture9-1.html)|29|75분|
|10-1|[DNA 파일의 선택과 Random Access 방법](week10/lecture10-1.html)|30|75분|
|11-1|[PCR과 Sanger 시퀀싱 및 게놈 프로젝트](week11/lecture11-1.html)|24|75분|
|11-2|[대량 병렬 시퀀싱과 DNBSEQ](week11/lecture11-2.html)|30|75분|
|11-3|[단일분자 시퀀싱과 Roche SBX](week11/lecture11-3.html)|24|75분|
|11-4|[고체 단백질 하이브리드 포어와 ONT](week11/lecture11-4.html)|28|75분|
|11-5|[나노포어 전압 전류 증폭기와 ADC](week11/lecture11-5.html)|29|75분|
|11-6|[라이브러리 커버리지와 FASTQ](week11/lecture11-6.html)|29|75분|

[9 10주차 참고 논문과 그림 출처](literature-v2.html)

11주차는 이전 6강의의 내용과 HTML을 유지한다. 보존 기간의 실측값과 모형 외삽값, 분자·서열·파일 수준 지표를 구분한다. Word 강의 대본은 교수용 별도 파일로 보관한다.

## 그림 출처

|그림|출처|이용 표기|
|---|---|---|
|amber_process.jpg|https://news.mit.edu/2024/scientists-preserve-dna-amber-polymer-0613|CC BY-NC-ND, 원그림 그대로|
|capsule_dna.jpg|https://news.mit.edu/2021/dna-data-storage-0610|CC BY-NC-ND, 원그림 그대로|
|cost_genome.jpg|https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data|NHGRI 명시적 강의 재사용 허용|
|pcr.jpg|https://www.genome.gov/about-genomics/fact-sheets/Polymerase-Chain-Reaction-Fact-Sheet|미국 정부 교육 그림|
|flowcell.jpg|https://www.illumina.com/science/technology/next-generation-sequencing/sequencing-technology.html|회사 공개 교육·제품 자료, 출처 표기|
|illumina_sbs.jpg|https://www.illumina.com/science/technology/next-generation-sequencing/sequencing-technology.html|회사 공개 교육·제품 자료, 출처 표기|
|minion.webp|https://nanoporetech.com/platform/technology|회사 공개 교육·제품 자료, 출처 표기|
|promethion.webp|https://nanoporetech.com/platform/technology|회사 공개 교육·제품 자료, 출처 표기|
|basecalling.webp|https://nanoporetech.com/platform/technology/basecalling|회사 공개 교육·제품 자료, 출처 표기|
|neural.webp|https://nanoporetech.com/platform/technology/basecalling|회사 공개 교육·제품 자료, 출처 표기|
|pore_types.webp|https://nanoporetech.com/platform/technology/basecalling|회사 공개 교육·제품 자료, 출처 표기|
|axelios.jpg|https://diagnostics.roche.com/us/en/products/systems/axelios-1-sys-597.html|회사 공개 교육·제품 자료, 출처 표기|
|aviti.jpg|https://www.elementbiosciences.com/technology|회사 공개 교육·제품 자료, 출처 표기|
|vega.png|https://www.pacb.com/vega/|회사 공개 교육·제품 자료, 출처 표기|
|pb_mechanism.png|https://www.pacb.com/technology/hifi-sequencing/how-it-works/|회사 공개 기술 자료|
|pb_reads.svg|https://www.pacb.com/technology/hifi-sequencing/how-it-works/|회사 공개 기술 자료|
|pb_accuracy.png|https://www.pacb.com/technology/hifi-sequencing/how-it-works/|회사 공개 기술 자료|
|access_fig1.png|https://www.nature.com/articles/s41467-020-14319-8|CC BY 4.0|
|access_fig2.png|https://www.nature.com/articles/s41467-020-14319-8|CC BY 4.0|
|access_fig3.png|https://www.nature.com/articles/s41467-020-14319-8|CC BY 4.0|
|dATP.png|https://pubchem.ncbi.nlm.nih.gov/|PubChem public chemical structure depiction|
|ddATP.png|https://pubchem.ncbi.nlm.nih.gov/|PubChem public chemical structure depiction|
|solid_fig1.png|https://doi.org/10.1371/journal.pone.0092880|CC BY|
|solid_fig4.png|https://doi.org/10.1371/journal.pone.0092880|CC BY|
|digidata.png|https://www.moleculardevices.com/products/axon-patch-clamp-system/digitizers/axon-digidata-1550b-plus-humsilencer|회사 공개 제품 이미지|
|axopatch.jpg|https://www.moleculardevices.com/products/axon-patch-clamp-system/amplifiers/axon-instruments-patch-clamp-amplifiers|회사 공개 제품 이미지|
|motor_steps.svg|Branton and Deamer 2019 Ch.5 Fig.5.3, 강의용 재구성 도식|기존 강의용 도식|
|protein_comparison.svg|Branton and Deamer 2019 Ch.4 Fig.4.1 p.50, 강의용 재구성|기존 강의용 도식|
|model_poisson.svg|분자정보공학 강의용 수학·회로 모형|강의 제작 그래프|
|model_transient.svg|분자정보공학 강의용 수학·회로 모형|강의 제작 그래프|
|model_adc.svg|분자정보공학 강의용 수학·회로 모형|강의 제작 그래프|
|doris_fig2.jpg|https://www.nature.com/articles/s41467-020-16797-2|CC BY 4.0|
|doris_fig3.jpg|https://www.nature.com/articles/s41467-020-16797-2|CC BY 4.0|
|mdram_fig1.jpg|https://www.nature.com/articles/s41598-023-29575-z|CC BY 4.0|
|mdram_fig2.jpg|https://www.nature.com/articles/s41598-023-29575-z|CC BY 4.0|
|mdram_fig4.jpg|https://www.nature.com/articles/s41598-023-29575-z|CC BY 4.0|
|stability_review_fig1.jpg|https://www.nature.com/articles/s41467-021-21587-5|CC BY 4.0|
|bonnet_fig10.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC2836546/|CC BY-NC 2.5|
|bonnet_fig6.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC2836546/|CC BY-NC 2.5|
|photonic_fig2.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12175888/|CC BY-NC 4.0|
|photonic_fig4.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12175888/|CC BY-NC 4.0|
|photonic_fig5.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12175888/|CC BY-NC 4.0|
|tape_fig2.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12422178/|CC BY-NC 4.0|
|tape_fig6.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12422178/|CC BY-NC 4.0|
|compare_preprint_fig1.jpg|https://doi.org/10.1101/2020.09.19.304014|CC BY-ND 4.0; whole figure unchanged|
|compare_preprint_fig2.jpg|https://doi.org/10.1101/2020.09.19.304014|CC BY-ND 4.0; whole figure unchanged|
|compare_preprint_fig4.jpg|https://doi.org/10.1101/2020.09.19.304014|CC BY-ND 4.0; whole figure unchanged|
|compare_preprint_fig5.jpg|https://doi.org/10.1101/2020.09.19.304014|CC BY-ND 4.0; whole figure unchanged|
|coudy_fig1.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC8585539/|CC BY 4.0|
|thermocapsule_fig1.png|https://pmc.ncbi.nlm.nih.gov/articles/PMC10427423/|CC BY 4.0|
|thermocapsule_fig5.png|https://pmc.ncbi.nlm.nih.gov/articles/PMC10427423/|CC BY 4.0|
|cas9_fig1.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12246221/|CC BY-NC-ND 4.0; whole figure unchanged|
|liquid_crystal_fig2.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12459424/|CC BY-NC 4.0|
|liquid_crystal_fig3.jpg|https://pmc.ncbi.nlm.nih.gov/articles/PMC12459424/|CC BY-NC 4.0|
