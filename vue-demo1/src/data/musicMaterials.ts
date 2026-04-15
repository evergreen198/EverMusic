import * as Tone from 'tone'
export interface MusicMaterial{
    id:number,
    name:string,
    key:string,
    url:string
}
const pianoUrl='../../public/materials/piano/'
// const guitarUrl='../../public/materials/guitar/'
export const musicMaterials:MusicMaterial[]=[
    {
        id:1,
        name:'C4vH',
        key:'C4vH',
        url:pianoUrl+'C4vH'
    },
    {
        id:1,
        name:'C1vH',
        key:'C1vH',
        url:pianoUrl+'C1vH'
    },
    {
        id:1,
        name:'C1vH',
        key:'C1vH',
        url:pianoUrl+'C1vH'
    }
]


export function StartPlay(){

    const synth = new Tone.Synth().toDestination()

    Tone.getTransport().bpm.setRampPoint(120)
    Tone.getTransport().schedule(() => {
        synth.triggerAttackRelease("E4", 1,2)
      }, 5)

      Tone.getTransport().schedule(() => {
        synth.triggerAttackRelease("G4", 1,2)
      }, 5)

      Tone.getTransport().start()

}

export
    function playAll(note:string):void{
        const sampler = new Tone.Sampler({
            urls: {
                C4: "C4vL.mp3",
                A4: "A4vH.mp3",
            },
            release: 1,
            baseUrl: "/materials/piano/",
        }).toDestination();
        Tone.loaded().then(() => {
    	sampler.triggerAttackRelease([`${note}`], 4);
    });
    }
