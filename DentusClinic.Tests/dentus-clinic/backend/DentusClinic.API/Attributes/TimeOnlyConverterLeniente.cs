using System.Text.Json;
using System.Text.Json.Serialization;

namespace DentusClinic.API.Attributes;

public class TimeOnlyConverterLeniente : JsonConverter<TimeOnly>
{
    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var valor = reader.GetString();
        return TimeOnly.TryParse(valor, out var hora) ? hora : TimeOnly.MinValue;
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("HH:mm:ss"));
    }
}
