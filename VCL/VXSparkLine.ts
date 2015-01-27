/// <reference path="Scripts/jquery.d.ts" />
import V = require("./VCL");
import VXC = require("./VXComponent");
import VXU = require("./VXUtils");
import VXO = require("./VXObject");
import VXD = require("./VXDataset");

export class TSparkBase extends VXC.TComponent {
    public values = new VXO.TCollection<TSparkValue>();
    public createValue(value: number): TSparkValue {
        var col: TSparkValue = new TSparkValue();
        col.Value = value;
        this.values.add(col);
        this.drawDelayed(true);
        return col;
    }
    public canvas: JQuery;
    public context: CanvasRenderingContext2D;
    public onClicked: (sender: TSparkBase ) => void;

    private _labelVisible: boolean = false;
    public get LabelVisible(): boolean {
        return this._labelVisible;
    }
    public set LabelVisible(val: boolean) {
        if (val != this._labelVisible) {
            this._labelVisible = val;
            this.drawDelayed(true);
        }
    }


    private _labetextcolor: string;
    public get LabelTextColor(): string {
        return this._labetextcolor;
    }
    public set LabelTextColor(val: string) {
        var isOk = /^#[0-9A-F]{6}$/i.test(val);
        if (!isOk) V.Application.raiseException("'" + val + "' is not valid hex color string");
        else {

            if (val != this._labetextcolor) {
                this._labetextcolor = val;
                this.drawDelayed(true);
            }
        }
    }



    private _labeltext: string = "";
    public get LabelText(): string {
        return this._labeltext;
    }
    public set LabelText(val: string) {
        if (val != this._labeltext) {
            this._labeltext = val;
            this.LabelVisible = true;
            this.drawDelayed(true);
        }
    }
    private _labelposition: V.LabelPosition = V.LabelPosition.BottomCenter;
    public get LabelPosition(): V.LabelPosition {
        return this._labelposition;
    }
    public set LabelPosition(val: V.LabelPosition) {
        if (val != this._labelposition) {
            this._labelposition = val;
            this.drawDelayed(true);
        }
    }

    public prepareCanvas(width, height) {
        this.canvas = $("<canvas>").css({ height: height, width: width }).addClass("peity");

        var tmpID: string = V.Application.genGUID();
        this.canvas.attr('id', tmpID);
        this.canvas.appendTo(this.jComponent);
        var ratio: number = ((< any > window).devicePixelRatio || 1);
        this.canvas.height(height * ratio);
        this.canvas.width(width * ratio); 
        this.context = (<HTMLCanvasElement>(this.canvas[0])).getContext('2d');
        this.context.canvas.height = height * ratio;
        this.context.canvas.width = width * ratio;
    }

    public getData(): number[] {
        var values: number[] = [];
        this.values.forEach((item : TSparkValue) => { values.push(item.Value); return true;});
        return values;
    }

    public jLabel: JQuery;
    public create() {
        if (this.LabelVisible) {
            this.jLabel = $('<small/>');
            this.jLabel.addClass('control-label');
            this.jLabel.addClass(V.Application.getBootstrapVersion() == 2 ? 'muted' :'text-muted');
            this.jLabel.text(this.LabelText);
            if (this.LabelTextColor) this.jLabel.css('color', this.LabelTextColor);
            if (this.LabelPosition == V.LabelPosition.TopLeft) {
                this.jComponent.prepend(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.TopCenter) {
                this.jLabel.addClass('text-center');
                this.jComponent.prepend(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.TopRight) {
                this.jLabel.addClass('text-right');
                this.jComponent.prepend(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.BottomLeft) {
                this.jComponent.append(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.Right) {
                this.jLabel.addClass('pull-right');
                this.jLabel.css('padding-top', '5px');
                this.jLabel.css('padding-left', '5px');
                this.jComponent.append(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.Left) {
                this.jLabel.addClass('pull-left');
                this.jLabel.css('padding-top', '5px');
                this.jLabel.css('padding-right', '5px');
                this.jComponent.append(this.jLabel)
            } else if (this.LabelPosition == V.LabelPosition.BottomCenter) {
                this.jLabel.addClass('text-center');
                this.jComponent.append(this.jLabel);
            } else if (this.LabelPosition == V.LabelPosition.BottomRight) {
                this.jLabel.addClass('text-right');
                this.jComponent.append(this.jLabel);
            }
        }
        super.create();
    }

    public draw(reCreate: boolean) {
        if (!this.parentInitialized())return;super.draw(reCreate);


    }
}


export class TSparkPie extends TSparkBase {
    public colours = ["#ff9900", "#fff4dd", "#ffc66e", "#4D4D4D", "#5DA5DA", "#FAA43A", "#60BD68", "#F17CB0", "#B2912F", "#B276B2", "#DECF3F", "#F15854"];

    /**
    @aOwner     Indicates the component that is responsible for streaming and freeing this component.Onwer must be TContainer
    @renderTo   (Optional) the id of the html element that will be the parent node for this component
    **/
    constructor(aOwner: VXC.TComponent, renderTo?: string) {
        super(aOwner, renderTo);
        this.Height = 40;
        this.Width = 40;
    }

    public create() {
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.empty();
        this.jComponent.off("click").click(() => { if (this.onClicked != null) (V.tryAndCatch(() => { this.onClicked(this); })); return false;  })
        var values : number[] =  this.getData();

        var length = values.length;
        var sum = 0;
        for (var i = 0; i < length; i++) { sum += values[i] }
        var canvas = this.prepareCanvas(this.Width || 16, this.Height || 16)
        var width = this.canvas.width();
        var height = this.canvas.height();
        var radius = Math.min(width, height) / 2;

        this.context.save();
        this.context.translate(width / 2, height / 2);
        this.context.rotate(-Math.PI / 2);
        for (var i = 0; i < length; i++) {
            var value = values[i];
            var slice = (value / sum) * Math.PI * 2;
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.arc(0, 0, radius, 0, slice, false);
            this.context.fillStyle = this.colours[i];
            this.context.fill();
            this.context.rotate(slice);
        }
        this.context.restore();
        super.create();
    }
}



export class TSparkLine extends TSparkBase {
    private _strokewidth: number = 1;
    public get StrokeWidth(): number {
        return this._strokewidth;
    }
    public set StrokeWidth(val: number) {
        if (val != this._strokewidth) {
            this._strokewidth = val;
            this.drawDelayed(true);
        }
    }

    /**
    @aOwner     Indicates the component that is responsible for streaming and freeing this component.Onwer must be TContainer
    @renderTo   (Optional) the id of the html element that will be the parent node for this component
    **/
    constructor(aOwner: VXC.TComponent, renderTo?: string) {
        super(aOwner, renderTo);
        this.Height = 20;
        this.Width = 40;
    }


    private _strokecolor: string = '#4d89f9';
    public get StrokeColor(): string {
        return this._strokecolor;
    }
    public set StrokeColor(val: string) {
        var isOk = /^#[0-9A-F]{6}$/i.test(val);
        if (!isOk) V.Application.raiseException("'" + val + "' is not valid hex color string");
        else {
            if (val != this._strokecolor) {
                this._strokecolor = val;
                this.drawDelayed(true);
            }
        }
    }

    private _color: string = '#c6d9fd';
    public get Color(): string {
        return this._color;
    }
    public set Color(val: string) {
        var isOk = /^#[0-9A-F]{6}$/i.test(val);
        if (!isOk) V.Application.raiseException("'" + val + "' is not valid hex color string");
        else {

            if (val != this._color) {
                this._color = val;
                this.drawDelayed(true);
            }
        }
    }



    public create() {
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.empty();
        this.jComponent.off("click").click(() => { if (this.onClicked != null) (V.tryAndCatch(() => { this.onClicked(this); })); return false;  })
        var values: number[] = this.getData();

        if (values.length == 1) values.push(values[0]);
        var max = Math.max.apply(Math, values.concat([null]));
        var min = Math.min.apply(Math, values.concat([0]));
        var canvas = this.prepareCanvas(this.Width || 32, this.Height || 16);
        var context = this.context;
        var width: number= this.canvas.width();
        var height :number= this.canvas.height();
        var xQuotient: number= width / (values.length - 1)
        var yQuotient: number= height / (max - min)
        var coords = [];
 
        context.beginPath();
        context.moveTo(0, height + (min * yQuotient))
        for (var i = 0; i < values.length; i++) {
            var x = i * xQuotient;
            var y = height - (yQuotient * (values[i] - min));
            coords.push({ x: x, y: y });;
            context.lineTo(x, y);
        }
        context.lineTo(width, height + (min * yQuotient));
        context.fillStyle = this.Color;
        context.fill();
        if (this.StrokeWidth && coords.length > 0) {
            context.beginPath();
            context.moveTo(0, coords[0].y);
            for (var i = 0; i < coords.length; i++) { context.lineTo(coords[i].x, coords[i].y); };
            context.lineWidth = this.StrokeWidth * ((< any > window).devicePixelRatio || 1)
            context.strokeStyle = this.StrokeColor;
            context.stroke();
        }

        super.create();
    }
}

export class TSparkBar extends TSparkBase {
    public colours = ["#4d89f9"];
    private _spacing: number = 1;
    public get Spacing(): number {
        return this._spacing;
    }
    public set Spacing(val: number) {
        if (val != this._spacing) {
            this._spacing = val;
            this.drawDelayed(true);
        }
    }

    /**
    @aOwner     Indicates the component that is responsible for streaming and freeing this component.Onwer must be TContainer
    @renderTo   (Optional) the id of the html element that will be the parent node for this component
    **/
    constructor(aOwner: VXC.TComponent, renderTo?: string) {
        super(aOwner,renderTo);
        this.Height = 20;
        this.Width = 40;
    }


    public create() {
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.empty();
        this.jComponent.off("click").click(() => { if (this.onClicked != null) (V.tryAndCatch(() => { this.onClicked(this); })); return false;  })
        var values: number[] = this.getData();

        var max = Math.max.apply(Math, values.concat([null]));
        var min = Math.min.apply(Math, values.concat([0]))
        var canvas = this.prepareCanvas(this.Width || 32, this.Height || 16)
        var context = this.context
        var width : number = this.canvas.width();
        var height: number = this.canvas.height();
        var yQuotient: number= height / (max - min)
        var space = this.Spacing;
        var xQuotient = (width + space) / values.length
        var colours = this.colours;
        for (var i = 0; i < values.length; i++) {
            var value = values[i]
            var y = height - (yQuotient * (value - min));
            var h;
            if (value == 0) {
                if (min >= 0 || max > 0) y -= 1
                h = 1
            } else {
                h = yQuotient * values[i]
            }
            context.fillStyle = this.colours[i];
            context.fillRect(i * xQuotient, y, xQuotient - space, h);
        }

        super.create();
    }
}


export class TDBSparkBar extends TSparkBar {
    private _dataset: VXD.TDataset;
    /**
    * Specifies the dataset that contains the field it represents.
    */
    public get Dataset(): VXD.TDataset {
        return this._dataset;
    }

    public set Dataset(val: VXD.TDataset) {
        val = (<any>this).checkDataset(val);
        if (val != this._dataset) {
            if (this._dataset) {
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this);
            }
            this._dataset = val;
            if (this._dataset) {
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this, () => { this.drawDelayed(true); });
            }       
        }
    }

    private _datafield: string;
    /**
    * Specifies the field from which the edit control displays data.
    */
    public get DataField(): string {
        return this._datafield;
    }
    public set DataField(val: string) {
        if (val != this._datafield) {
            this._datafield = val.toUpperCase();
            this.drawDelayed(true);
        }
    }

    public getData(): number[] {
        var values: number[] = [];
        if (this.Dataset == null || this.DataField == null) return values;
        if (!this.Dataset.Active) return values;
        this.Dataset.forEach(() => {
            var val: number = this.Dataset.getFieldValue(this.DataField);
            if (val != null) values.push(val);
        });
        return values;
    }

    public create() {
        if (!this.Dataset) this.Dataset = (<any>this).guessDataset();
        super.create();
    }
}


export class TDBSparkPie extends TSparkPie {
    private _dataset: VXD.TDataset;
    /**
    * Specifies the dataset that contains the field it represents.
    */
    public get Dataset(): VXD.TDataset {
        return this._dataset;
    }

    public set Dataset(val: VXD.TDataset) {
        val = (<any>this).checkDataset(val);
        if (val != this._dataset) {
            if (this._dataset) {
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this);
            }
            this._dataset = val;
            if (this._dataset) {
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this, () => { this.drawDelayed(true); });
            }       
            
        }
    }

    private _datafield: string;
    /**
    * Specifies the field from which the edit control displays data.
    */
    public get DataField(): string {
        return this._datafield;
    }
    public set DataField(val: string) {
        if (val != this._datafield) {
            this._datafield = val.toUpperCase();
            this.drawDelayed(true);
        }
    }

    public getData(): number[] {
        var values: number[] = [];
        if (this.Dataset == null || this.DataField == null) return values;
        if (!this.Dataset.Active) return values;
        this.Dataset.forEach(() => {
            var val: number = this.Dataset.getFieldValue(this.DataField);
            if (val != null) values.push(val);
        });
        return values;
    }

    public create() {
        if (!this.Dataset) this.Dataset = (<any>this).guessDataset();
        super.create();
    }

}

export class TDBSparkLine extends TSparkLine {
    private _dataset: VXD.TDataset;
    /**
    * Specifies the dataset that contains the field it represents.
    */
    public get Dataset(): VXD.TDataset {
        return this._dataset;
    }

    public set Dataset(val: VXD.TDataset) {
        val = (<any>this).checkDataset(val);
        if (val != this._dataset) {
            if (this._dataset) {
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this);
                (<any>this._dataset).removeEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this);
            }
            this._dataset = val;
            if (this._dataset) {
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_DATA_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_SELECTION_CHANGED, this, () => { this.drawDelayed(true); });
                (<any>this._dataset).registerEventListener(VXD.TDataset.EVENT_STATE_CHANGED, this, () => { this.drawDelayed(true); });
            }         
        }
    }

    private _datafield: string;
    /**
    * Specifies the field from which the edit control displays data.
    */
    public get DataField(): string {
        return this._datafield;
    }
    public set DataField(val: string) {
        if (val != this._datafield) {
            this._datafield = val.toUpperCase();
            this.drawDelayed(true);
        }
    }

    public getData(): number[] {
        var values: number[] = [];
        if (this.Dataset == null || this.DataField == null) return values;
        if (!this.Dataset.Active) return values;
        this.Dataset.forEach(() => {
            var val: number = this.Dataset.getFieldValue(this.DataField);
            if (val != null) values.push(val);
        });
        return values;
    }

    public create() {
        if (!this.Dataset) this.Dataset = (<any>this).guessDataset();
        super.create();
    }

}



export class TSparkValue extends VXO.TCollectionItem {
    private _value: number = null;
    public get Value(): number {
        return this._value;
    }
    public set Value(val: number) {
        if (val != this._value) {
            this._value = val;
        }
    }
}
